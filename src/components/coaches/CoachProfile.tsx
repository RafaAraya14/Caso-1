import React, { useEffect, useState } from 'react';

import { ThemeToggle } from '../ui/ThemeToggle';

import type { Coach } from '../../types/coach';

interface CoachProfileProps {
  coach: Coach;
  onBackToSearch: () => void;
  onConnectNow: (coach: Coach) => void;
  onSendMessage: (coach: Coach) => void;
  onLogout?: () => void;
}

interface Review {
  name: string;
  date: string;
  stars: number;
  comment: string;
}

const CoachProfile: React.FC<CoachProfileProps> = ({
  coach,
  onBackToSearch,
  onConnectNow,
  onSendMessage,
  onLogout,
}) => {
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  // Cargar reseñas del localStorage al montar el componente
  useEffect(() => {
    const savedReviews = localStorage.getItem(`coach-reviews-${coach.id}`);
    const localReviews = savedReviews ? JSON.parse(savedReviews) : [];

    // Combinar reseñas originales con las nuevas del localStorage
    const combinedReviews = [...localReviews, ...coach.reviews];
    setAllReviews(combinedReviews);
  }, [coach.id, coach.reviews]);

  const isAvailable = coach.status === 'Disponible';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${
          i < rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
        }`}
      />
    ));
  };

  const renderReviewStars = (stars: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${
          i < stars ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans gradient-bg">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Logout Button */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="fixed bottom-4 right-4 w-12 h-12 rounded-full text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none z-30 flex items-center justify-center"
        >
          <i className="fas fa-sign-out-alt text-lg" />
        </button>
      )}

      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={onBackToSearch}
              className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center font-semibold transition-colors"
            >
              <i className="fas fa-arrow-left mr-2" />
              Volver
            </button>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl rounded-2xl p-8 mb-8 flex flex-col md:flex-row gap-8">
            {/* Avatar and Status */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="relative mb-4">
                <i className={`fas fa-user-circle text-8xl ${coach.avatarColor}`} />
                <span
                  className={`absolute bottom-1 right-1 block h-6 w-6 ${
                    isAvailable ? 'bg-green-500' : 'bg-slate-500'
                  } border-4 border-white dark:border-slate-800 rounded-full`}
                />
              </div>
              <span
                className={`${
                  isAvailable
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                } text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2`}
              >
                {coach.status}
              </span>
            </div>

            {/* Profile Info and Actions */}
            <div className="w-full">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                {coach.displayname}
              </h3>
              <p className="text-indigo-600 text-lg mb-3 font-medium">{coach.specialties}</p>

              <div className="flex items-center text-slate-600 dark:text-slate-300 space-x-4 text-sm mb-6">
                <span className="flex items-center">
                  {renderStars(Math.floor(coach.rating))}
                  <span className="ml-2">
                    {coach.rating} ({allReviews.length} reseñas)
                  </span>
                </span>
                <span className="flex items-center">
                  <i className="fas fa-map-marker-alt text-red-500 mr-1" />
                  {coach.city}, {coach.country}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onConnectNow(coach)}
                  disabled={!isAvailable}
                  className={`flex-1 ${
                    isAvailable
                      ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                      : 'bg-slate-400 cursor-not-allowed'
                  } text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transform hover:scale-105 transition-transform disabled:transform-none`}
                >
                  <i className="fas fa-bolt mr-2" />
                  Conectar Ahora
                </button>
                <button
                  onClick={() => onSendMessage(coach)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transform hover:scale-105 transition-transform"
                >
                  <i className="fas fa-envelope mr-2" />
                  Mensaje
                </button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl rounded-2xl p-8 mb-8">
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              Sobre {coach.displayname.split(' ')[0]}
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{coach.bio}</p>
          </div>

          {/* Reviews Section */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl rounded-2xl p-8">
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              Reseñas Recientes
            </h4>

            {allReviews.length > 0 ? (
              <div className="space-y-6">
                {allReviews.map((review, index) => (
                  <div
                    key={index}
                    className={`${
                      index > 0 ? 'border-t border-slate-200 dark:border-slate-700 pt-6' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold text-slate-800 dark:text-white">{review.name}</h5>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">{renderReviewStars(review.stars)}</div>
                    <p className="text-slate-600 dark:text-slate-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Este coach aún no tiene reseñas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachProfile;
