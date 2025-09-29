// src/hooks/useSessionController.ts
import { useState } from 'react'
import { createSessionAndConsumeCredit } from '../services/SessionService'
import { supabase } from '../lib/supabase'

export function useSessionController() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hireCoach = async (coachId: number) => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = await createSessionAndConsumeCredit(coachId)

      // refrescar créditos mostrados en UI (si tenés un componente que los lee)
      // una opción simple es invalidar el último paquete con un refetch:
      await supabase.from('userpackages').select('creditsremaining')
      return sessionId
    } catch (e: any) {
      setError(e.message ?? 'No se pudo crear la sesión')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { hireCoach, loading, error }
}
