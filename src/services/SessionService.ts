// src/services/SessionService.ts
import { supabase } from '../lib/supabase'

export async function createSessionAndConsumeCredit(coachId: number) {
  const { data, error } = await supabase.rpc('create_session_and_consume_credit', {
    p_coach_id: coachId
  })

  if (error) {
    // Podés mapear errores a mensajes de UI
    throw new Error(error.message)
  }
  // data = id de la sesión creada (bigint)
  return data as number
}
