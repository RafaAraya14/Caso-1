// src/middleware/errorHandlerMiddleware.ts
import { CustomError } from '../error-handling/CustomError';
import { logger } from '../logging/logger';

// ----- Template for how to handle errors centrally ------
// Called from catch blocks.
export const handleApiError = (
  error: unknown,
  userMessage: string = 'Ocurrió un error inesperado.'
) => {
  if (error instanceof CustomError) {
    logger.error(error.message, error, {
      component: 'errorHandlerMiddleware',
      metadata: { errorCode: (error as any).code }
    });
    // Return a friendly message based on the error type
    return error.friendlyMessage;
  }

  // If it's a generic error
  const genericError = error instanceof Error ? error : new Error('Unknown error');
  logger.error('Generic API Error', genericError);

  return userMessage;
};
