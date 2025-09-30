// src/services/SessionService.ts
import { ErrorHandler, CustomError } from '../error-handling';
import { supabase } from '../lib/supabase';
import { logger } from '../logging';

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
  logger.session('CreateSession', 'Iniciando creación de sesión', {
    userId,
    metadata: { coachId },
  });

  try {
    // 1) Buscar el último paquete del usuario (el "activo")
    const { data: pkg, error: pkgError } = await supabase
      .from('userpackages')
      .select('id, creditsremaining')
      .eq('useridfk', userId)
      .order('purchasedat', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pkgError) {
      throw CustomError.database(`Error al cargar paquete: ${pkgError.message}`);
    }

    if (!pkg) {
      throw CustomError.businessLogic('No user packages found', 'No tienes paquetes activos.');
    }

    if ((pkg.creditsremaining ?? 0) <= 0) {
      throw CustomError.businessLogic('No credits available', 'No tienes créditos disponibles.');
    }

    // 2) Crear la sesión
    interface SessionRow {
      id: string;
    }
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ userid: userId, coachid: coachId, createdat: new Date().toISOString() })
      .select('id')
      .single<SessionRow>();

    if (sessionError) {
      throw CustomError.database(`No se pudo crear la sesión: ${sessionError.message}`);
    }

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
        logger.session('CreateSession', 'Rollback de sesión completado', {
          userId,
          sessionId: session.id,
        });
      } catch (rollbackError) {
        logger.error('Error durante rollback de sesión', rollbackError as Error, {
          component: 'Session',
          action: 'CreateSession',
          userId,
          sessionId: session.id,
        });
      }

      throw CustomError.database(`No se pudo descontar el crédito: ${updError.message}`);
    }

    logger.session('CreateSession', 'Sesión creada y crédito descontado exitosamente', {
      userId,
      sessionId: session.id,
      metadata: {
        coachId,
        creditsRemaining: (pkg.creditsremaining as number) - 1,
      },
    });

    return session.id;
  } catch (error) {
    const errorMessage = ErrorHandler.handle(error, {
      component: 'Session',
      action: 'CreateSession',
      userId,
    });

    // Re-lanzar el error para que el llamador pueda manejarlo
    if (error instanceof CustomError) {
      throw error;
    } else {
      throw CustomError.database(`Error inesperado creando sesión: ${errorMessage}`);
    }
  }
}
