// src/components/auth/AuthProvider/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '../../../lib/supabase';

import type { User } from '@supabase/supabase-js';

type Role = 'BasicUser' | 'PremiumUser';
interface Ctx {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<Ctx>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRole(u: User | null) {
    if (!u) {
      return setRole(null);
    }
    const { data } = await supabase.from('profiles').select('role').eq('userid', u.id).single();
    setRole((data?.role as Role) ?? null);
  }

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      await loadRole(u);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      const u = s?.user ?? null;
      setUser(u);
      await loadRole(u);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('AuthProvider: Iniciando signOut...');
      await supabase.auth.signOut();
      console.log('AuthProvider: SignOut de Supabase completado');
      setUser(null);
      setRole(null);
      console.log('AuthProvider: Estado local limpiado');
    } catch (error) {
      console.error('AuthProvider: Error en signOut:', error);
      // Limpiar estado local incluso si hay error
      setUser(null);
      setRole(null);
    }
  };

  return <AuthCtx.Provider value={{ user, role, loading, signOut }}>{children}</AuthCtx.Provider>;
};

export default AuthProvider;

export const useAuth = () => useContext(AuthCtx);
