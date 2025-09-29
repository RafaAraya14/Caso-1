// src/components/auth/LoginForm/LoginForm.tsx
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // eslint-disable-next-line no-console
      console.log('[LOGIN] start', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      // eslint-disable-next-line no-console
      console.log('[LOGIN] result', { data, error });
      if (error) throw error;

      navigate('/dashboard', { replace: true });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[LOGIN] error', e);
      if (e instanceof Error) {
        setErr(e.message); // Muestra de error
      } else {
        setErr('Ocurrió un error inesperado');
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-3">
      <input
        className="w-full border px-3 py-2 rounded"
        type="email"
        placeholder="email@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="w-full border px-3 py-2 rounded"
        type="password"
        placeholder="••••••••"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        required
      />
      <button
        className="w-full px-3 py-2 rounded bg-brand-700 text-white disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? 'Ingresando…' : 'Iniciar sesión'}
      </button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </form>
  );
};

export default LoginForm;
