import { Card } from '../../ui/Card';

interface CoachInfoSidebarProps {
  rating: number;
  specialtyCount: number;
  status: 'available' | 'busy' | 'offline';
}

export const CoachInfoSidebar: React.FC<CoachInfoSidebarProps> = ({
  rating,
  specialtyCount,
  status,
}) => {
  const statusText = {
    available: 'Disponible',
    busy: 'Ocupado',
    offline: 'No disponible',
  };

  const statusColor = {
    available: 'text-green-400',
    busy: 'text-yellow-400',
    offline: 'text-red-400',
  };

  return (
    <Card>
      <h3 className="font-semibold text-slate-100 mb-3">Información</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Rating:</span>
          <span className="text-slate-200">{rating}/5.0</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Especialidades:</span>
          <span className="text-slate-200">{specialtyCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Estado:</span>
          <span className={statusColor[status]}>{statusText[status]}</span>
        </div>
      </div>
    </Card>
  );
};
