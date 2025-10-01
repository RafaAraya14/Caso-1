import React, { useEffect, useState } from 'react';

import { ThemeToggle } from '../ui/ThemeToggle';

import type { Coach } from '../../types/coach';

interface VideoCallProps {
  coach: Coach;
  onEndCall: () => void;
  onSessionComplete?: () => void;
  onLogout?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ coach, onEndCall, onSessionComplete, onLogout }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remainingTime, setRemainingTime] = useState(1200); // 20 minutos en segundos
  const [isConnecting, setIsConnecting] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');

  // Simular conexión de la llamada
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  // Contador regresivo de la sesión
  useEffect(() => {
    if (!isConnecting && remainingTime > 0) {
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
  }, [isConnecting, remainingTime]);

  const formatRemainingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
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
    if (remainingTime > 0) {
      // Llamada finalizada antes del tiempo, mostrar modal de calificación
      setShowRatingModal(true);
    } else {
      // Tiempo agotado, ir directamente al final
      onSessionComplete?.(); // Track session completion
      onEndCall();
    }
  };

  if (isConnecting) {
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
      className={`${isFullscreen ? 'fixed inset-0' : 'min-h-screen'} bg-slate-900 text-white flex flex-col z-50`}
    >
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <img
                src={coach.profileimage || '/placeholder-avatar.jpg'}
                alt={coach.displayname}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-lg font-semibold">{coach.displayname}</h1>
                <p className="text-sm text-slate-300">
                  Tiempo restante: {formatRemainingTime(remainingTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {!isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg text-white hover:bg-slate-700 transition-colors"
              >
                <i className="fas fa-expand text-lg" />
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-white hover:bg-slate-700 transition-colors"
              >
                <i className="fas fa-sign-out-alt text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Coach Video (Main) */}
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
          {isVideoOn ? (
            <div className="relative w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <div className="text-center">
                <img
                  src={coach.profileimage || '/placeholder-avatar.jpg'}
                  alt={coach.displayname}
                  className="w-48 h-48 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-500"
                />
                <p className="text-slate-300">Video del coach</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-slate-800">
              <div className="text-center">
                <i className="fas fa-video-slash text-6xl text-slate-500 mb-4" />
                <p className="text-slate-300">Video desactivado</p>
              </div>
            </div>
          )}
        </div>

        {/* User Video (Picture in Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600">
          {isVideoOn ? (
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-user text-4xl text-white mb-2" />
                <p className="text-white text-sm">Tu video</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <i className="fas fa-video-slash text-2xl text-slate-400" />
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="absolute top-4 left-4">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2" />
            Conectado
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center space-x-6">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioOn
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <i className={`fas ${isAudioOn ? 'fa-microphone' : 'fa-microphone-slash'} text-xl`} />
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOn
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <i className={`fas ${isVideoOn ? 'fa-video' : 'fa-video-slash'} text-xl`} />
          </button>

          {/* Screen Share */}
          <button className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors">
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
