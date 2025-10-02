import React, { useState } from 'react';

import { useAuth } from '../components/auth';
import { VideoCall } from '../components/sessions';
import { Button } from '../components/ui/Button/Button';
import { createSessionAndConsumeCredit } from '../services/SessionService';

interface VideoCallDemoProps {
  coachId: number;
}

/**
 * Demo component showing how to integrate video calls into the coaching flow
 */
export const VideoCallDemo: React.FC<VideoCallDemoProps> = ({ coachId }) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = async () => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      return;
    }

    setIsCreatingSession(true);
    setError(null);

    try {
      // Create session and consume credit
      const newSessionId = await createSessionAndConsumeCredit(user.id, coachId);
      setSessionId(newSessionId);
      console.log('Session created:', newSessionId);
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err instanceof Error ? err.message : 'Error creando sesión');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleCallEnd = () => {
    console.log('Call ended');
    setCallEnded(true);
    setSessionId(null);
  };

  const handleError = (error: string) => {
    console.error('Video call error:', error);
    setError(error);
  };

  const handleRemoteUserJoined = (userId: string) => {
    console.log('Coach joined the call:', userId);
    // You could show a notification here
  };

  const handleRemoteUserLeft = (userId: string) => {
    console.log('Coach left the call:', userId);
    // You could show a notification or end the call
  };

  // Show success message after call
  if (callEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Sesión Completada</h2>
          <p className="text-gray-400 mb-6">Tu sesión de coaching ha terminado exitosamente.</p>
          <Button
            onClick={() => {
              setCallEnded(false);
              setError(null);
            }}
            variant="primary"
          >
            Nueva Sesión
          </Button>
        </div>
      </div>
    );
  }

  // Show video call interface
  if (sessionId && user) {
    return (
      <VideoCall
        sessionId={sessionId}
        userId={user.id}
        onCallEnd={handleCallEnd}
        onError={handleError}
        onRemoteUserJoined={handleRemoteUserJoined}
        onRemoteUserLeft={handleRemoteUserLeft}
      />
    );
  }

  // Show initial screen
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Sesión de Coaching</h1>
        <p className="text-gray-400 mb-8">
          Conecta con tu coach a través de videollamada para una sesión personalizada de 20 minutos.
        </p>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleStartSession}
            disabled={isCreatingSession || !user}
            loading={isCreatingSession}
            variant="primary"
            className="w-full"
          >
            {isCreatingSession ? 'Iniciando sesión...' : 'Comenzar Videollamada'}
          </Button>

          {!user && (
            <p className="text-sm text-gray-400">
              Debes iniciar sesión para comenzar una videollamada
            </p>
          )}
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>Requisitos:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Cámara web y micrófono</li>
            <li>Conexión a internet estable</li>
            <li>Navegador moderno (Chrome, Firefox, Safari)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoCallDemo;