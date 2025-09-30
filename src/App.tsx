import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './styles/globals.css';
import { CoachSearch } from './components/coaches/CoachSearch/CoachSearchPrototype';
import SimpleLoginForm from './components/auth/SimpleLogin';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  is_premium?: boolean;
}

// Header component for logged-in users
const Header: React.FC<{ user: User; profile: UserProfile | null; onLogout: () => void }> = ({ user, profile, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-800 dark:text-white">
          20minCoach
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-300 text-sm hidden sm:block">{user.email}</span>
            {profile?.is_premium && (
              <span className="bg-yellow-400 dark:bg-yellow-500 text-gray-800 dark:text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                Premium
              </span>
            )}
          </div>
          <ThemeToggle />
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

// Public navigation for logged-out users
const PublicNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-2 shadow-lg">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => navigate('/login')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === '/login'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          🔐 Login
        </button>
        <div className="border-l border-gray-300 dark:border-gray-600 pl-2 ml-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

// A layout for authenticated users
const ProtectedLayout: React.FC<{ user: User; profile: UserProfile | null; onLogout: () => void; children: React.ReactNode }> = ({ user, profile, onLogout, children }) => {
  return (
    <>
      <Header user={user} profile={profile} onLogout={onLogout} />
      <main className="pt-20">
        {children}
      </main>
    </>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Exception when fetching profile:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      }
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (_event === 'SIGNED_IN' && currentUser) {
        await fetchUserProfile(currentUser);
        navigate('/dashboard');
      } else if (_event === 'SIGNED_OUT') {
        setProfile(null);
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fetchUserProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center"><p className="text-white">Loading...</p></div>;
  }

  return (
    <div className="App">
      {!user && <PublicNavigation />}
      <Routes>
        <Route path="/login" element={!user ? <SimpleLoginForm onLoginSuccess={() => {}} /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Route */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <ProtectedLayout user={user} profile={profile} onLogout={handleLogout}>
                <CoachSearch />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}
