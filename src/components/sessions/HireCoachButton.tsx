import React from 'react';
import { useAuth } from '../auth';                    // barrel de auth dentro de components
import useSessionController from '../../hooks/useSessionController';

type Props = { coachId: number; onHired?: (sessionId: string | number) => void };

const HireCoachButton: React.FC<Props> = ({ coachId, onHired }) => {
  const { user } = useAuth();
  const { hireCoach, loading, error } = useSessionController();

  const onClick = async () => {
    if (!user?.id) return;
    const sessionId = await hireCoach(coachId, user.id); // ⬅️ AQUÍ va tu línea
    onHired?.(sessionId);
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        onClick={onClick}
        disabled={loading || !user?.id}
        className="px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-60"
      >
        {loading ? 'Creando sesión…' : 'Contratar coach'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
};

export default HireCoachButton;
