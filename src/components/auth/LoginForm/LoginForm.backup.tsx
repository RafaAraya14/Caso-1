// src/components/auth/LoginForm/LoginForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { logger } from '../../../logging';
import { ErrorHandler } from '../../../error-handling';

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
    
    logger.auth(mode === 'login' ? 'Login' : 'Register', `Usuario ${mode === 'login' ? 'iniciando sesión' : 'registrándose'}`, { 
      metadata: { email } 
    });
    
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
      
      logger.auth(mode === 'login' ? 'Login' : 'Register', `Usuario ${mode === 'login' ? 'autenticado' : 'registrado'} exitosamente`, {
        userId: data.user?.id,
        metadata: { email }
      });
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const errorMessage = ErrorHandler.handle(error, {
        component: 'Auth',
        action: mode === 'login' ? 'Login' : 'Register',
        userId: email
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-100">20minCoach</h1>
            <p className="text-slate-400 mt-2">Inicia sesión en tu cuenta</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="email@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            
            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              variant="primary"
            >
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
            
            {err && (
              <div className="bg-red-950/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{err}</p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
