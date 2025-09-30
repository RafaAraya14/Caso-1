// src/components/auth/LoginForm/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorHandler } from '../../../error-handling';
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../logging';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    logger.auth(
      mode === 'login' ? 'Login' : 'Register',
      `Usuario ${mode === 'login' ? 'iniciando sesión' : 'registrándose'}`,
      {
        metadata: { email },
      }
    );

    try {
      let result;

      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password: pass,
        });
      }

      const { data, error } = result;

      if (error) {
        throw error;
      }

      if (mode === 'register' && !data.session) {
        setErr('Por favor revisa tu email para confirmar tu cuenta.');
        return;
      }

      logger.auth(
        mode === 'login' ? 'Login' : 'Register',
        `Usuario ${mode === 'login' ? 'autenticado' : 'registrado'} exitosamente`,
        {
          userId: data.user?.id,
          metadata: { email },
        }
      );

      navigate('/dashboard', { replace: true });
    } catch (error) {
      const errorMessage = ErrorHandler.handle(error, {
        component: 'Auth',
        action: mode === 'login' ? 'Login' : 'Register',
        userId: email,
      });
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@20mincoach.com');
    setPass('demo123456');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">20minCoach</h1>
            <p className="text-gray-400">
              {mode === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta nueva'}
            </p>
          </div>

          {/* Demo Instructions */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
            <h3 className="text-blue-300 font-semibold mb-2">🔍 Prueba el PoC de Autenticación:</h3>
            <div className="space-y-2 text-sm text-blue-200">
              <p>
                • <strong>Opción 1:</strong> Usa credenciales demo (click botón abajo)
              </p>
              <p>
                • <strong>Opción 2:</strong> Registra una cuenta nueva
              </p>
              <p>
                • <strong>Opción 3:</strong> Usa cualquier email válido para probar
              </p>
            </div>
            <Button
              onClick={fillDemoCredentials}
              variant="secondary"
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              📧 Llenar Credenciales Demo
            </Button>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-gray-700 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="email@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            >
              {loading
                ? mode === 'login'
                  ? 'Iniciando sesión...'
                  : 'Creando cuenta...'
                : mode === 'login'
                  ? '🔐 Iniciar Sesión'
                  : '✨ Crear Cuenta'}
            </Button>

            {err && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-300 text-sm">{err}</p>
              </div>
            )}

            {/* Demo Info */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                🧪 <strong>Esto es un PoC</strong> - Integración funcional con Supabase
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
