// src/types/dtos/CreateSessionDTO.ts

/**
 * DTO para crear una nueva sesión
 * Usado para transferir datos entre capas sin exponer modelos internos
 */
export interface CreateSessionDTO {
  userId: string;
  coachId: string;
  scheduledDateTime: string; // ISO 8601 format
  duration: number; // En minutos
  sessionType: 'video-call' | 'phone-call' | 'in-person';
  topic?: string;
  notes?: string;
  timezone?: string;
  scheduledTime?: string; // Compatibilidad con implementación anterior
  specialty?: string; // Compatibilidad con implementación anterior
  preferredDuration?: number; // Compatibilidad con implementación anterior
}

/**
 * DTO de respuesta al crear una sesión
 */
export interface CreateSessionResponseDTO {
  sessionId: string;
  userId: string;
  coachId: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  cost: number;
  duration: number;
  meetingLink?: string;
  createdAt: string;
}

/**
 * DTO para actualizar una sesión
 */
export interface UpdateSessionDTO {
  sessionId: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  rating?: number; // 1-5 estrellas
  feedback?: string;
}

/**
 * DTO para listar sesiones
 */
export interface SessionListItemDTO {
  sessionId: string;
  coachName: string;
  coachSpecialties: string[];
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  duration: number;
  cost: number;
}
