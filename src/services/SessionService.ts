// src/services/SessionService.ts
import { CustomError, ErrorHandler } from '../error-handling';
import { supabase } from '../lib/supabase';
import { logger } from '../logging';

// Types for video session management
export interface VideoSession {
  id: string;
  userId: string;
  coachId: number;
  status: 'pending' | 'active' | 'ended' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // in minutes
}

export interface SessionParticipant {
  userId: string;
  sessionId: string;
  joinedAt: string;
  leftAt?: string;
  role: 'client' | 'coach';
}

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

// Video Call Management Functions

/**
 * Inicia una videollamada para una sesión existente
 */
export async function startVideoCall(sessionId: string, userId: string): Promise<void> {
  logger.session('StartVideoCall', 'Iniciando videollamada', { userId, sessionId });

  try {
    // Verificar que la sesión existe y pertenece al usuario
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, userid, coachid, status')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      throw CustomError.database(`Error al verificar sesión: ${sessionError.message}`);
    }

    if (!session) {
      throw CustomError.businessLogic('Session not found', 'Sesión no encontrada.');
    }

    // Verificar que el usuario es parte de la sesión
    if (session.userid !== userId) {
      // También verificar si es el coach
      const { data: coach } = await supabase
        .from('coaches')
        .select('id')
        .eq('id', session.coachid)
        .single();

      if (!coach || coach.id.toString() !== userId) {
        throw CustomError.authorization('No autorizado para esta sesión');
      }
    }

    // Actualizar estado de la sesión a "active"
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'active',
        startedAt: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      throw CustomError.database(`Error al actualizar sesión: ${updateError.message}`);
    }

    // Registrar participante
    await addSessionParticipant(sessionId, userId, session.userid === userId ? 'client' : 'coach');

    logger.session('StartVideoCall', 'Videollamada iniciada exitosamente', {
      userId,
      sessionId,
    });
  } catch (error) {
    const errorMessage = ErrorHandler.handle(error, {
      component: 'Session',
      action: 'StartVideoCall',
      userId,
      sessionId,
    });

    if (error instanceof CustomError) {
      throw error;
    } else {
      throw CustomError.database(`Error inesperado iniciando videollamada: ${errorMessage}`);
    }
  }
}

/**
 * Finaliza una videollamada
 */
export async function endVideoCall(
  sessionId: string,
  userId: string,
  duration?: number
): Promise<void> {
  logger.session('EndVideoCall', 'Finalizando videollamada', { userId, sessionId });

  try {
    // Actualizar estado de la sesión a "ended"
    const updateData: Record<string, any> = {
      status: 'ended',
      endedAt: new Date().toISOString(),
    };

    if (duration) {
      updateData.duration = duration;
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (updateError) {
      throw CustomError.database(`Error al finalizar sesión: ${updateError.message}`);
    }

    // Marcar salida del participante
    await removeSessionParticipant(sessionId, userId);

    logger.session('EndVideoCall', 'Videollamada finalizada exitosamente', {
      userId,
      sessionId,
    });
  } catch (error) {
    const errorMessage = ErrorHandler.handle(error, {
      component: 'Session',
      action: 'EndVideoCall',
      userId,
      sessionId,
    });

    if (error instanceof CustomError) {
      throw error;
    } else {
      throw CustomError.database(`Error inesperado finalizando videollamada: ${errorMessage}`);
    }
  }
}

/**
 * Obtiene información de una sesión de video
 */
export async function getVideoSession(sessionId: string): Promise<VideoSession | null> {
  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.userid,
      coachId: session.coachid,
      status: session.status || 'pending',
      createdAt: session.createdat,
      startedAt: session.startedat,
      endedAt: session.endedat,
      duration: session.duration,
    };
  } catch (error) {
    logger.error('Error obteniendo sesión de video', error as Error, {
      component: 'Session',
      action: 'GetVideoSession',
      sessionId,
    });
    return null;
  }
}

/**
 * Agrega un participante a la sesión
 */
async function addSessionParticipant(
  sessionId: string,
  userId: string,
  role: 'client' | 'coach'
): Promise<void> {
  const { error } = await supabase.from('session_participants').insert({
    sessionId,
    userId,
    role,
    joinedAt: new Date().toISOString(),
  });

  if (error) {
    logger.error('Error agregando participante a sesión', error, {
      component: 'Session',
      action: 'AddParticipant',
      sessionId,
      userId,
    });
  }
}

/**
 * Remueve un participante de la sesión
 */
async function removeSessionParticipant(sessionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('session_participants')
    .update({ leftAt: new Date().toISOString() })
    .eq('sessionId', sessionId)
    .eq('userId', userId)
    .is('leftAt', null);

  if (error) {
    logger.error('Error removiendo participante de sesión', error, {
      component: 'Session',
      action: 'RemoveParticipant',
      sessionId,
      userId,
    });
  }
}

/**
 * Obtiene participantes activos de una sesión
 */
export async function getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
  try {
    const { data: participants, error } = await supabase
      .from('session_participants')
      .select('*')
      .eq('sessionId', sessionId)
      .is('leftAt', null);

    if (error || !participants) {
      return [];
    }

    return participants.map(p => ({
      userId: p.userId,
      sessionId: p.sessionId,
      joinedAt: p.joinedAt,
      leftAt: p.leftAt,
      role: p.role,
    }));
  } catch (error) {
    logger.error('Error obteniendo participantes de sesión', error as Error, {
      component: 'Session',
      action: 'GetSessionParticipants',
      sessionId,
    });
    return [];
  }
}
