import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import AuthFlow from './components/auth/AuthFlow';
import { useAuth } from './components/auth/AuthProvider/AuthProvider';
import CoachApp from './components/coaches/CoachApp';
import CameraDebug from './pages/CameraDebug';
import CameraDemo from './pages/CameraDemo';
import { SimpleCameraTest } from './pages/SimpleCameraTest';
import './styles/globals.css';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Manejar navegación automática cuando cambia el estado de auth
  useEffect(() => {
    if (!loading) {
      if (!user && window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
      } else if (user && window.location.pathname === '/login') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    // La navegación automática se maneja en el useEffect de arriba
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white text-lg">Loading...</p>
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
