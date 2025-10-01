import { Card } from '../../ui/Card';

interface CoachHeaderProps {
  name: string;
  rating: number;
  status: 'available' | 'busy' | 'offline';
}

export const CoachHeader: React.FC<CoachHeaderProps> = ({ name, rating, status }) => {
  const statusConfig = {
    available: {
      bg: 'bg-green-900/50',
      text: 'text-green-400',
      border: 'border-green-500/30',
      label: 'Disponible',
    },
    busy: {
      bg: 'bg-yellow-900/50',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      label: 'Ocupado',
    },
    offline: {
      bg: 'bg-red-900/50',
      text: 'text-red-400',
      border: 'border-red-500/30',
      label: 'No disponible',
    },
  };

  const statusStyle = statusConfig[status];

  return (
    <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{name}</h1>
          <div className="flex items-center mt-2">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="ml-1 text-lg font-semibold text-slate-200">{rating}</span>
            <span className="ml-2 text-slate-400">Rating</span>
          </div>
        </div>
        <span
          className={`px-4 py-2 ${statusStyle.bg} ${statusStyle.text} rounded-lg border ${statusStyle.border}`}
        >
          {statusStyle.label}
        </span>
      </div>
    </Card>
  );
};
