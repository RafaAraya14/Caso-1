import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import AuthFlow from './components/auth/AuthFlow';
import CoachApp from './components/coaches/CoachApp';
import { supabase } from './lib/supabase';
import CameraDebug from './pages/CameraDebug';
import CameraDemo from './pages/CameraDemo';
import { SimpleCameraTest } from './pages/SimpleCameraTest';
import './styles/globals.css';

import type { User } from '@supabase/supabase-js';

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
      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <AuthFlow onAuthSuccess={() => navigate('/dashboard')} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <CoachApp onLogout={handleLogout} user={{ email: user.email || '' }} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/camera-demo" element={<CameraDemo />} />
        <Route path="/camera-test" element={<SimpleCameraTest />} />
        <Route path="/camera-debug" element={<CameraDebug />} />

        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </div>
  );
}
