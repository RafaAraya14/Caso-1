import { Card } from '../../ui/Card';

interface CoachAboutProps {
  description: string;
}

export const CoachAbout: React.FC<CoachAboutProps> = ({ description }) => {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-3">Acerca de mí</h2>
      <p className="text-slate-300 leading-relaxed">{description}</p>
    </Card>
  );
};
