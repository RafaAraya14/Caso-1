// src/components/dashboard/DashboardPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useUserCredits } from '../../hooks/useUserCredits';
import HireCoachButton from '../sessions/HireCoachButton';
 
const mockCoaches = [
  { id: 101, name: 'Coach Ana' },
  { id: 102, name: 'Coach Bruno' },
  { id: 103, name: 'Coach Carla' },
];

const DashboardPage: React.FC = () => {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const { credits, loading: creditLoading, error } = useUserCredits(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [authLoading, user, navigate]);

  if (authLoading) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button onClick={handleLogout} className="px-3 py-2 rounded border hover:bg-gray-50">
          Cerrar sesión
        </button>
      </header>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <section className="mb-6 space-y-1">
        <p><strong>Rol:</strong> {role ?? '—'}</p>
        <p><strong>Créditos:</strong> {creditLoading ? 'Cargando…' : credits ?? '—'}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Coaches disponibles</h2>
        <ul className="space-y-3">
          {mockCoaches.map((c) => (
            <li className="flex items-center justify-between p-3 border rounded">
              <span>{c.name}</span>
              <HireCoachButton coachId={c.id} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default DashboardPage;
