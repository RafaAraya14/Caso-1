// src/components/dashboard/DashboardPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUserCredits } from '../../hooks/useUserCredits';
import { useAuth } from '../auth';
import HireCoachButton from '../sessions/HireCoachButton';
import { Button } from '../ui/Button/Button';
import { Card } from '../ui/Card';

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
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              Cerrar sesión
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-500/50 bg-red-950/20">
            <p className="text-red-400">{error}</p>
          </Card>
        )}

        {/* User Info */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Información del Usuario</h2>
          <div className="space-y-2 text-slate-300">
            <p>
              <span className="font-medium text-slate-200">Rol:</span> {role ?? '—'}
            </p>
            <p>
              <span className="font-medium text-slate-200">Créditos:</span>{' '}
              {creditLoading ? 'Cargando…' : (credits ?? '—')}
            </p>
          </div>
        </Card>

        {/* Coaches Section */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Coaches Disponibles</h2>
          <div className="space-y-4">
            {mockCoaches.map(c => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <span className="text-slate-200 font-medium">{c.name}</span>
                <HireCoachButton coachId={c.id} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
};

export default DashboardPage;
