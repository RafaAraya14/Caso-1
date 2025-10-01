import { Button } from '../../ui/Button/Button';
import { Card } from '../../ui/Card';

interface CoachCTAProps {
  onHireClick: () => void;
  isAvailable: boolean;
}

export const CoachCTA: React.FC<CoachCTAProps> = ({ onHireClick, isAvailable }) => {
  return (
    <Card className="bg-blue-950/30 border-blue-500/30">
      <h3 className="font-semibold text-blue-300 mb-2">¿Listo para comenzar?</h3>
      <p className="text-blue-200 text-sm mb-4">
        Agenda una sesión de 20 minutos y comienza tu transformación hoy.
      </p>
      <Button variant="primary" className="w-full" onClick={onHireClick} disabled={!isAvailable}>
        {isAvailable ? 'Contratar Coach' : 'No Disponible'}
      </Button>
    </Card>
  );
};
