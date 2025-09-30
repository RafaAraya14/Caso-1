// src/services/api/coachApi.ts
import { supabase } from '../../lib/supabase';
import { Coach } from '../../models/Coach';
import { logger } from '../../logging';
import { ErrorHandler } from '../../error-handling';

/**
 * Convierte datos de la base de datos a un objeto Coach
 */
function mapToCoach(data: Record<string, unknown>): Coach {
  return new Coach(
    data.id?.toString() || '0',
    data.name as string || 'Unknown Coach',
    data.rating as number || 0,
    data.specialties as string[] || [],
    data.is_available as boolean || false,
    data.sessions_today as number || 0
  );
}

/**
 * Obtiene todos los coaches disponibles
 */
export async function getAllCoaches(): Promise<Coach[]> {
  try {
    logger.api('GetAllCoaches', 'Fetching all coaches from database');
    
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      throw error;
    }

    const coaches = (data || []).map(mapToCoach);
    
    logger.api('GetAllCoaches', 'Coaches fetched successfully', {
      metadata: { count: coaches.length }
    });
    
    return coaches;
  } catch (error) {
    const errorMessage = ErrorHandler.handle(error, {
      component: 'CoachAPI',
      action: 'GetAllCoaches'
    });
    throw new Error(errorMessage);
  }
}

/**
 * Obtiene un coach específico por ID
 */
export async function getCoachById(id: string): Promise<Coach | null> {
  try {
    logger.api('GetCoachById', `Fetching coach with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Coach not found
      }
      throw error;
    }

    return mapToCoach(data);
  } catch (error) {
    const errorMessage = ErrorHandler.handle(error, {
      component: 'CoachAPI',
      action: 'GetCoachById'
    });
    throw new Error(errorMessage);
  }
}

/**
 * Mock data para cuando no hay base de datos configurada
 */
const mockCoaches: Coach[] = [
  new Coach('1', 'Ana García', 4.8, ['Life Coaching', 'Career Coaching'], true, 2),
  new Coach('2', 'Bruno Silva', 4.6, ['Business Coaching', 'Leadership'], true, 1),
  new Coach('3', 'Carla López', 4.9, ['Health & Wellness', 'Nutrition'], true, 0),
  new Coach('4', 'David Rodriguez', 4.4, ['Mindfulness', 'Stress Management'], false, 5),
  new Coach('5', 'Elena Martín', 4.7, ['Executive Coaching', 'Communication'], true, 3)
];

/**
 * Función que retorna mock data o datos reales dependiendo del ambiente
 */
export async function getAllCoachesWithFallback(): Promise<Coach[]> {
  try {
    // Intentar obtener datos reales
    return await getAllCoaches();
  } catch {
    logger.warn('Failed to fetch coaches from database, using mock data', {
      component: 'CoachAPI',
      action: 'GetAllCoachesWithFallback'
    });
    
    // Retornar mock data si falla
    return mockCoaches;
  }
}

export const coachApi = {
  getAllCoaches,
  getAllCoachesWithFallback,
  getCoachById,
};