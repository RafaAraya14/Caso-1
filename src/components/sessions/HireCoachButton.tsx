import React from 'react';

import useSessionController from '../../hooks/useSessionController';
import { useAuth } from '../auth';
import { Button } from '../ui/Button';

interface Props {
  coachId: number;
  onHired?: (sessionId: string | number) => void;
}

const HireCoachButton: React.FC<Props> = ({ coachId, onHired }) => {
  const { user } = useAuth();
  const { hireCoach, loading, error } = useSessionController();

  const onClick = async () => {
    if (!user?.id) {
      return;
    }
    const sessionId = await hireCoach(coachId, user.id);
    onHired?.(sessionId);
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={onClick}
        disabled={!user?.id}
        loading={loading}
        variant="primary"
        className="w-full"
      >
        {loading ? 'Creando sesión…' : 'Contratar coach'}
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default HireCoachButton;
