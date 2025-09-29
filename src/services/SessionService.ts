// src/services/SessionService.ts
import { supabase } from '../lib/supabase';

/**
 * Crea una sesión y consume 1 crédito del último paquete del usuario.
 * Devuelve el ID de la sesión creada.
 *
 * Ajusta nombres de tablas/columnas si en tu esquema se llaman distinto.
 * - Tabla userpackages: id, useridfk, creditsremaining, purchasedat
 * - Tabla sessions: id, userid, coachid, createdat
 */
export async function createSessionAndConsumeCredit(
  userId: string,
  coachId: number
): Promise<string> {
  // 1) Buscar el último paquete del usuario (el "activo")
  const { data: pkg, error: pkgError } = await supabase
    .from('userpackages')
    .select('id, creditsremaining')
    .eq('useridfk', userId)
    .order('purchasedat', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pkgError) throw new Error(`Error al cargar paquete: ${pkgError.message}`);
  if (!pkg) throw new Error('No tienes paquetes activos.');
  if ((pkg.creditsremaining ?? 0) <= 0) throw new Error('No tienes créditos disponibles.');

  // 2) Crear la sesión
  type SessionRow = { id: string };
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({ userid: userId, coachid: coachId, createdat: new Date().toISOString() })
    .select('id')
    .single<SessionRow>();

  if (sessionError) throw new Error(`No se pudo crear la sesión: ${sessionError.message}`);

  // 3) Descontar 1 crédito del paquete (condicional: sólo si > 0)
  const { error: updError } = await supabase
    .from('userpackages')
    .update({ creditsremaining: (pkg.creditsremaining as number) - 1 })
    .eq('id', pkg.id)
    .gt('creditsremaining', 0);

  if (updError) {
    // (Opcional) rollback suave: eliminar la sesión recién creada
    try {
      await supabase.from('sessions').delete().eq('id', session.id);
    } catch {
      // Si falla el rollback, lo registras en logs. No re-lanzamos para no ocultar el error original.
    }
    throw new Error(`No se pudo descontar el crédito: ${updError.message}`);
  }

  return session.id;
}

/** Si querés mantener la clase para otros usos, unificamos tipos también */
export class SessionService {
  async createSession(userId: string, coachId: number): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`Creating session for user ${userId} with coach ${coachId}`);
    return Promise.resolve();
  }
}
