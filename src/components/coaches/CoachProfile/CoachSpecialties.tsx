import { Card } from '../../ui/Card';

interface CoachSpecialtiesProps {
  specialties: string[];
}

export const CoachSpecialties: React.FC<CoachSpecialtiesProps> = ({ specialties }) => {
  const getSpecialtyStyle = (specialty: string) => {
    // Diferentes colores para diferentes especialidades
    const styles = [
      'bg-blue-900/50 text-blue-300 border-blue-500/30',
      'bg-green-900/50 text-green-300 border-green-500/30',
      'bg-purple-900/50 text-purple-300 border-purple-500/30',
      'bg-orange-900/50 text-orange-300 border-orange-500/30',
    ];
    const index = specialty.length % styles.length;
    return styles[index];
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-100 mb-3">Especialidades</h2>
      <div className="flex flex-wrap gap-2">
        {specialties.map((specialty, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full border ${getSpecialtyStyle(specialty)}`}
          >
            {specialty}
          </span>
        ))}
      </div>
    </Card>
  );
};
