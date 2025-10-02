import React from 'react';

interface UserProfileProps {
  user: { email: string };
  currentPlan: 'free' | 'premium';
  sessionsUsed?: number;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  currentPlan,
  sessionsUsed = 0,
  isOpen,
  onClose,
  onLogout,
}) => {
  if (!isOpen) {
    return null;
  }

  const maxFreeSessions = 10;
  const remainingSessions = currentPlan === 'free' ? maxFreeSessions - sessionsUsed : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        aria-label="Cerrar perfil de usuario"
      />

      {/* Profile Modal */}
      <div className="fixed top-4 left-4 z-50 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Mi Perfil</h3>
                <p className="text-white/80 text-sm">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-times text-sm" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Plan Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
              <i className="fas fa-crown text-yellow-500 mr-2" />
              Plan Actual
            </h4>

            <div
              className={`p-4 rounded-xl border-2 ${
                currentPlan === 'premium'
                  ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
                  : 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {currentPlan === 'premium' ? 'Plan Premium' : 'Plan Gratuito'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentPlan === 'premium' ? '₡15,000/mes' : '₡0/mes'}
                  </p>
                </div>
                {currentPlan === 'premium' && (
                  <i className="fas fa-crown text-yellow-500 text-xl" />
                )}
              </div>
            </div>
          </div>

          {/* Sessions Information for Free Plan */}
          {currentPlan === 'free' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
                <i className="fas fa-video text-blue-500 mr-2" />
                Sesiones Disponibles
              </h4>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Usadas este mes
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {sessionsUsed} / {maxFreeSessions}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(sessionsUsed / maxFreeSessions) * 100}%` }}
                  />
                </div>

                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  {remainingSessions !== null && remainingSessions > 0
                    ? `Te quedan ${remainingSessions} sesiones`
                    : 'Has agotado tus sesiones mensuales'}
                </p>
              </div>
            </div>
          )}

          {/* Premium Sessions Info */}
          {currentPlan === 'premium' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
                <i className="fas fa-infinity text-purple-500 mr-2" />
                Sesiones Premium
              </h4>

              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-infinity text-purple-500 text-xl" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Sesiones Ilimitadas
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Disfruta sin restricciones
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onLogout}
              className="w-full p-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-sign-out-alt" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
