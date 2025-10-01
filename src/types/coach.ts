// Tipos compartidos para coaches basados en el diagrama de BD
export interface Coach {
  id: number;
  userId: string;
  displayname: string;
  specialties: string;
  rating: number;
  city: string;
  country: string;
  status: 'Disponible' | 'Ocupado' | 'Desconectado';
  reviewsCount: number;
  bio: string;
  avatarColor: string;
  profileimage?: string;
  reviews: {
    name: string;
    date: string;
    stars: number;
    comment: string;
  }[];
}

// Datos simulados que imitan la estructura de la base de datos
export const mockCoachesData: Coach[] = [
  {
    id: 1,
    userId: 'uuid-user-1',
    displayname: 'Carlos Mendoza',
    specialties: 'Mecánica Automotriz',
    rating: 4.8,
    city: 'Bogotá',
    country: 'Colombia',
    status: 'Disponible',
    reviewsCount: 127,
    bio: 'Especialista en mecánica automotriz con más de 10 años de experiencia. Me especializo en diagnósticos complejos y reparaciones de motores. He trabajado con una amplia variedad de marcas y modelos, desde vehículos clásicos hasta los más modernos con tecnología híbrida y eléctrica.',
    reviews: [
      {
        name: 'Juan Carlos',
        date: 'hace 2 días',
        stars: 5,
        comment: 'Excelente sesión, resolvió mi problema rápidamente.',
      },
      {
        name: 'María López',
        date: 'hace 1 semana',
        stars: 5,
        comment: 'Súper recomendado, muy profesional.',
      },
    ],
    avatarColor: 'text-blue-400',
  },
  {
    id: 2,
    userId: 'uuid-user-2',
    displayname: 'María García',
    specialties: 'Psicología Clínica',
    rating: 4.9,
    city: 'Medellín',
    country: 'Colombia',
    status: 'Disponible',
    reviewsCount: 203,
    bio: 'Psicóloga con enfoque humanista, especializada en terapia cognitivo-conductual y manejo de ansiedad. Cuento con más de 15 años de experiencia ayudando a personas a superar sus desafíos emocionales y mentales. Mi objetivo es crear un espacio seguro donde puedas explorar tus pensamientos y sentimientos.',
    reviews: [
      {
        name: 'Ana Sofía',
        date: 'hace 1 día',
        stars: 5,
        comment: 'María es increíble, me ayudó muchísimo.',
      },
      {
        name: 'Pedro R.',
        date: 'hace 3 semanas',
        stars: 5,
        comment: 'Una gran profesional, muy empática.',
      },
    ],
    avatarColor: 'text-pink-400',
  },
  {
    id: 3,
    userId: 'uuid-user-3',
    displayname: 'Ana Silva',
    specialties: 'Pintura y Arte',
    rating: 4.7,
    city: 'Cali',
    country: 'Colombia',
    status: 'Ocupado',
    reviewsCount: 89,
    bio: 'Artista profesional y profesora de pintura con técnicas tradicionales y modernas. He dedicado mi vida al arte, explorando diferentes medios y estilos. Me encanta compartir mi conocimiento y ayudar a otros a descubrir su creatividad a través del color y la forma.',
    reviews: [
      {
        name: 'Laura M.',
        date: 'hace 5 días',
        stars: 5,
        comment: 'Excelente maestra, muy paciente.',
      },
    ],
    avatarColor: 'text-purple-400',
  },
  {
    id: 4,
    userId: 'uuid-user-4',
    displayname: 'Luis Ramírez',
    specialties: 'Programación Web',
    rating: 4.6,
    city: 'Barranquilla',
    country: 'Colombia',
    status: 'Disponible',
    reviewsCount: 156,
    bio: 'Desarrollador Full Stack con experiencia en React, Node.js y bases de datos modernas. He trabajado en proyectos desde startups hasta grandes corporaciones. Mi pasión es enseñar programación de manera práctica y accesible, ayudando a otros a construir aplicaciones web increíbles.',
    reviews: [
      {
        name: 'Carlos T.',
        date: 'hace 3 días',
        stars: 4,
        comment: 'Muy buen coach, explica muy bien.',
      },
      {
        name: 'Sofia L.',
        date: 'hace 1 semana',
        stars: 5,
        comment: 'Luis me ayudó a entender React perfectamente.',
      },
    ],
    avatarColor: 'text-green-400',
  },
];
