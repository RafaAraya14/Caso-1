import { CoachAbout } from './CoachAbout';
import { CoachCTA } from './CoachCTA';
import { CoachHeader } from './CoachHeader';
import { CoachInfoSidebar } from './CoachInfoSidebar';
import { CoachSpecialties } from './CoachSpecialties';

interface CoachProfileProps {
  name?: string;
  rating?: number;
  status?: 'available' | 'busy' | 'offline';
  specialties?: string[];
  description?: string;
  onHireClick?: () => void;
}

export const CoachProfile: React.FC<CoachProfileProps> = ({
  name = 'Coach Example',
  rating = 4.8,
  status = 'available',
  specialties = ['Life Coaching', 'Career Coaching'],
  description = 'Soy un coach profesional con amplia experiencia ayudando a personas a alcanzar sus objetivos. Mi enfoque se basa en metodologías probadas y un acompañamiento personalizado.',
  onHireClick = () => {},
}) => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <CoachHeader name={name} rating={rating} status={status} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <CoachSpecialties specialties={specialties} />
          <CoachAbout description={description} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CoachInfoSidebar rating={rating} specialtyCount={specialties.length} status={status} />
          <CoachCTA onHireClick={onHireClick} isAvailable={status === 'available'} />
        </div>
      </div>
    </div>
  );
};
