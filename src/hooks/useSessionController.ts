// src/hooks/useSessionController.ts
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { createSessionAndConsumeCredit } from '../services/SessionService';

export function useSessionController() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // coachId: número del coach a contratar
  // userId: id del usuario autenticado (para invalidar su cache de créditos)
  const hireCoach = async (coachId: number, userId?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        throw new Error('Usuario no autenticado.');
      }

      // ⬇️ AQUÍ van las líneas que preguntas
      const sessionId = await createSessionAndConsumeCredit(userId, coachId);
      await queryClient.invalidateQueries({ queryKey: ['credits', userId] });
      // ⬆️ invalidate hace que useUserCredits refresque automáticamente

      return sessionId;
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? 'No se pudo crear la sesión';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { hireCoach, loading, error };
}

export default useSessionController;
