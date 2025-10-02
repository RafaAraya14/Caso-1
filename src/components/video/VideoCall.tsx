import React, { useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '../ui/ThemeToggle';

import type { Coach } from '../../types/coach';

interface VideoCallProps {
  coach: Coach;
  onEndCall: () => void;
  onSessionComplete?: () => void;
  onLogout?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ coach, onEndCall, onSessionComplete }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remainingTime, setRemainingTime] = useState(1200); // 20 minutos en segundos
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Estados locales para controlar la conexión (prototipo)
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [showConnectingScreen, setShowConnectingScreen] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Función directa para pedir permisos de cámara
  const requestCameraPermission = async () => {
    try {
      setCameraError(null);

      // Limpiar stream anterior si existe
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setIsCameraOn(false);
      }

      // Pedir permisos al usuario
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      setLocalStream(stream);
      setIsCameraOn(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      setCameraError(`No se pudo acceder a la cámara: ${msg}`);
      setIsCameraOn(false);
    }
  };

  // NO activar cámara automáticamente
  // El usuario debe dar permiso manualmente

  // Simular que ya estamos "conectados" al coach (sin cámara)
  useEffect(() => {
    // Mostrar pantalla de conexión por 2 segundos, luego la interfaz de videollamada
    const timer = setTimeout(() => {
      setShowConnectingScreen(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Limpiar stream al desmontar el componente
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Configurar video cuando se obtiene el stream
  useEffect(() => {
    console.log('Configurando video - localVideoRef:', localVideoRef.current);
    console.log('Configurando video - localStream:', localStream);

    if (localVideoRef.current && localStream) {
      try {
        // Asegurar que el elemento video esté listo
        const videoElement = localVideoRef.current;
        videoElement.srcObject = localStream;
        videoElement.muted = true;

        console.log('Stream asignado al video correctamente');

        // Intentar reproducir inmediatamente
        videoElement
          .play()
          .then(() => {
            console.log('✅ Video reproduciéndose correctamente');
          })
          .catch(err => {
            console.log('No se pudo auto-reproducir el video:', err);
            // Intentar de nuevo después de un pequeño delay
            setTimeout(() => {
              videoElement.play().catch(() => {
                console.log('Segundo intento de reproducción falló');
              });
            }, 500);
          });
      } catch (error) {
        console.error('Error asignando stream:', error);
      }
    } else {
      console.log(
        'No se pudo asignar stream - ref:',
        !!localVideoRef.current,
        'stream:',
        !!localStream
      );
    }
  }, [localStream]);

  // Limpiar stream al desmontar
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Configurar referencias de video cuando cambien los streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Contador regresivo de la sesión
  useEffect(() => {
    if (!showConnectingScreen && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // Tiempo agotado, mostrar modal de calificación
            setShowRatingModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showConnectingScreen, remainingTime]);

  const formatRemainingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleVideo = async () => {
    if (!isCameraOn) {
      // Pedir permisos cuando el usuario hace clic
      await requestCameraPermission();
    } else {
      // Desactivar cámara
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setIsCameraOn(false);
      }
    }
  };

  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicrophoneOn(audioTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSubmitRating = () => {
    if (selectedRating > 0) {
      // Crear nueva reseña
      const newReview = {
        name: 'Usuario Actual', // En un sistema real, esto vendría del usuario autenticado
        date: new Date().toLocaleDateString('es-ES'),
        stars: selectedRating,
        comment:
          comment.trim() ||
          `Sesión calificada con ${selectedRating} estrella${selectedRating > 1 ? 's' : ''}`,
      };

      // Obtener reseñas existentes del localStorage
      const existingReviews = localStorage.getItem(`coach-reviews-${coach.id}`);
      const reviews = existingReviews ? JSON.parse(existingReviews) : [];

      // Agregar nueva reseña
      reviews.unshift(newReview); // Agregar al inicio para que aparezca primero

      // Guardar en localStorage
      localStorage.setItem(`coach-reviews-${coach.id}`, JSON.stringify(reviews));

      console.log('Reseña guardada:', newReview);
    }

    setShowRatingModal(false);
    onSessionComplete?.(); // Track session completion
    onEndCall();
  };

  const handleEndCall = () => {
    // Limpiar stream de cámara al salir
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setIsCameraOn(false);
    }

    if (showRatingModal) {
      onEndCall();
    } else {
      setShowRatingModal(true);
    }
  };

  if (showConnectingScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center z-50">
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <img
              src={coach.profileimage || '/placeholder-avatar.jpg'}
              alt={coach.displayname}
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-indigo-500"
            />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Conectando con {coach.displayname}</h2>
          <p className="text-slate-400 mb-6">Preparando la videollamada...</p>

          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" />
            <div
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            />
            <div
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>

        <button
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
        >
          <i className="fas fa-phone-slash mr-2" />
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0' : 'min-h-screen'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col z-50`}
    >
      {/* Header */}
      <div className="bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="flex items-center space-x-3">
              <img
                src={coach.profileimage || '/placeholder-avatar.jpg'}
                alt={coach.displayname}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg font-semibold">{coach.displayname}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Tiempo restante: {formatRemainingTime(remainingTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <i className="fas fa-expand text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Coach Video (Main) */}
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
          <div className="flex items-center justify-center w-full h-full bg-slate-200 dark:bg-slate-800">
            <div className="text-center">
              <img
                src={coach.profileimage || '/placeholder-avatar.jpg'}
                alt={coach.displayname}
                className="w-48 h-48 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-500"
              />
              <p className="text-slate-600 dark:text-slate-300">Esperando al coach...</p>
            </div>
          </div>
        </div>

        {/* User Video (Picture in Picture) - Movido para evitar superposición */}
        <div className="absolute top-20 right-4 w-48 h-36 bg-slate-300 dark:bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-400 dark:border-slate-600">
          {isCameraOn && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                {!localStream ? (
                  <div>
                    <i className="fas fa-video text-xl text-slate-400 mb-2" />
                    <p className="text-xs text-slate-400 mb-2">
                      {cameraError ? 'Error de cámara' : 'Usa el botón de video de abajo'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <i className="fas fa-video-slash text-xl text-slate-400 mb-1" />
                    <p className="text-xs text-slate-400">Cámara desactivada</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Tú
          </div>
          {/* Indicador de estado de cámara */}
          <div className="absolute top-1 left-1">
            {localStream ? (
              <div
                className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-green-500' : 'bg-red-500'}`}
              />
            ) : (
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
            )}
          </div>
        </div>

        {/* Connection Status - Movido para evitar superposición */}
        <div className="absolute top-20 left-4">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2" />
            Conectado
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center space-x-6">
          {/* Audio Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isMicrophoneOn
                ? 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <i
              className={`fas ${isMicrophoneOn ? 'fa-microphone' : 'fa-microphone-slash'} text-xl`}
            />
          </button>

          {/* Video Toggle */}
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isCameraOn
                ? 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-700 dark:text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <i className={`fas ${isCameraOn ? 'fa-video' : 'fa-video-slash'} text-xl`} />
          </button>

          {/* Screen Share */}
          <button className="p-4 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-700 dark:text-white transition-colors">
            <i className="fas fa-desktop text-xl" />
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <i className="fas fa-phone-slash text-xl" />
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <img
                src={coach.profileimage || '/placeholder-avatar.jpg'}
                alt={coach.displayname}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                ¿Cómo estuvo tu sesión?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Califica tu experiencia con {coach.displayname}
              </p>
            </div>

            {/* Rating Component */}
            <div className="space-y-6">
              {/* Star Rating */}
              <div className="text-center">
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className={`text-3xl transition-colors ${
                        star <= selectedRating
                          ? 'text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <i className="fas fa-star" />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedRating > 0
                    ? `Has calificado con ${selectedRating} estrella${selectedRating > 1 ? 's' : ''}`
                    : 'Haz clic en las estrellas para calificar'}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label
                  htmlFor="session-comment"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Comentario (opcional)
                </label>
                <textarea
                  id="session-comment"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Comparte tu experiencia con este coach..."
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    onSessionComplete?.(); // Track session completion
                    onEndCall();
                  }}
                  className="flex-1 py-3 px-4 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                >
                  Omitir
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={selectedRating === 0}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    selectedRating === 0
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Enviar{' '}
                  {selectedRating > 0 &&
                    `(${selectedRating} estrella${selectedRating > 1 ? 's' : ''})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
