import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import SimpleLoginForm from './components/auth/SimpleLogin';
import { CoachSearch } from './components/coaches/CoachSearch/CoachSearchPrototype';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { supabase } from './lib/supabase';
import './styles/globals.css';

import type { User } from '@supabase/supabase-js';

// Simple header for logged in users
const Header: React.FC<{ user: User; onLogout: () => void; loading?: boolean }> = ({
  user,
  onLogout,
  loading = false,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-800 dark:text-white">20minCoach</div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 dark:text-gray-300 text-sm">{user.email}</span>
          <ThemeToggle />
          <button
            onClick={onLogout}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
};

// Public navigation for non-logged users
const PublicNavigation: React.FC = () => {
  return (
    <nav className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-2 shadow-lg">
      <div className="flex gap-2 items-center">
        <span className="text-gray-700 dark:text-gray-300 text-sm">Login to continue</span>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Simple session check with aggressive timeout
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set timeout to force loading to finish
    const forceLoadComplete = setTimeout(() => {
      if (mounted && loading) {
        console.log('Forcing load complete - auth timeout');
        setUser(null);
        setLoading(false);
      }
    }, 3000);

    checkAuth();

    // Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      console.log('Auth state change:', event);
      const currentUser = session?.user ?? null;

      // Actualizar el estado del usuario
      setUser(currentUser);

      // Manejar navegación según el evento
      if (event === 'SIGNED_IN' && currentUser) {
        setLoading(false);
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        setLoading(false);
        navigate('/login');
      }
    });

    return () => {
      mounted = false;
      clearTimeout(forceLoadComplete);
      subscription.unsubscribe();
    };
  }, [navigate, loading]);

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...');

      // Deshabilitar botón durante el proceso
      setLoading(true);

      // Hacer signOut de Supabase
      await supabase.auth.signOut();

      console.log('Logout completado');

      // El listener onAuthStateChange se encargará de la navegación
      // cuando detecte el evento 'SIGNED_OUT'
    } catch (error) {
      console.error('Error durante logout:', error);

      // Si hay error, forzar la limpieza manual
      setUser(null);
      setLoading(false);
      navigate('/login');
    }
  };

  // Loading screen with timeout
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white text-lg">Loading...</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            If this takes too long, please refresh the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!user && <PublicNavigation />}

      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <SimpleLoginForm onLoginSuccess={() => navigate('/dashboard')} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <>
                <Header user={user} onLogout={handleLogout} loading={loading} />
                <main className="pt-20">
                  <CoachSearch />
                </main>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </div>
  );
}
