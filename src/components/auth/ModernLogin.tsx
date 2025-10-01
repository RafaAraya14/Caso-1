import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../lib/supabase';

interface ModernLoginProps {
  onLoginSuccess?: () => void;
  onShow2FA?: () => void;
}

const ModernLogin: React.FC<ModernLoginProps> = ({ onLoginSuccess, onShow2FA }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage('Por favor completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setMessage(signInError.message);
        return;
      }

      if (data.user) {
        // For now, we'll simulate showing 2FA for all users
        // In production, you'd check if the user has 2FA enabled
        if (onShow2FA) {
          onShow2FA();
        } else {
          // Fallback: navigate directly if no 2FA handler
          navigate('/dashboard');
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }
      }
    } catch (err) {
      setMessage('Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-2xl p-8 text-center">
          <div className="flex flex-col items-center mb-6">
            {/* Logo Minimalista SVG */}
            <svg className="w-24 h-24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradLogin1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a5b4fc" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="gradLogin2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f9a8d4" />
                  <stop offset="100%" stopColor="#be185d" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="url(#gradLogin1)"
                strokeWidth="4"
              />
              <path
                d="M25 50 C 35 30, 65 30, 75 50 C 65 70, 35 70, 25 50 Z"
                stroke="url(#gradLogin2)"
                strokeWidth="4"
                fill="none"
              />
              <circle cx="50" cy="50" r="10" fill="url(#gradLogin1)" />
            </svg>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
              20min<span className="text-indigo-600">Coach</span>
            </h1>
          </div>

          <h2 className="text-2xl font-semibold text-center text-slate-800 dark:text-white mb-6">
            Bienvenido de Nuevo
          </h2>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.includes('error') || message.includes('Error')
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="text-left">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="shadow-sm appearance-none border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700/50 leading-tight focus:outline-none focus:ring-0 transition-colors"
                placeholder="tu@correo.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-slate-700 dark:text-slate-300 text-sm font-bold mb-2"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="shadow-sm appearance-none border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700/50 leading-tight focus:outline-none focus:ring-0 transition-colors"
                placeholder="******************"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex items-center justify-center mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Acceder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;
