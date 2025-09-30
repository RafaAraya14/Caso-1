import React, { useState } from 'react';

import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface Coach {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  price: number;
  location: string;
  avatar: string;
  isAvailable: boolean;
  responseTime: string;
  experience: string;
}

// Mock data for prototype
const mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    specialty: 'Mecánica Automotriz',
    rating: 4.8,
    reviewCount: 127,
    price: 15000,
    location: 'Bogotá, Colombia',
    avatar: '👨‍🔧',
    isAvailable: true,
    responseTime: '< 2 min',
    experience: '8 años',
  },
  {
    id: '2',
    name: 'María García',
    specialty: 'Psicología Clínica',
    rating: 4.9,
    reviewCount: 203,
    price: 25000,
    location: 'Medellín, Colombia',
    avatar: '👩‍⚕️',
    isAvailable: true,
    responseTime: '< 5 min',
    experience: '12 años',
  },
  {
    id: '3',
    name: 'Ana Silva',
    specialty: 'Pintura y Arte',
    rating: 4.7,
    reviewCount: 89,
    price: 20000,
    location: 'São Paulo, Brasil',
    avatar: '👩‍🎨',
    isAvailable: false,
    responseTime: '< 10 min',
    experience: '6 años',
  },
  {
    id: '4',
    name: 'Roberto Santos',
    specialty: 'Programación Web',
    rating: 4.9,
    reviewCount: 156,
    price: 30000,
    location: 'Rio de Janeiro, Brasil',
    avatar: '👨‍💻',
    isAvailable: true,
    responseTime: '< 3 min',
    experience: '10 años',
  },
];

const specialties = [
  'Todas las especialidades',
  'Mecánica Automotriz',
  'Psicología Clínica',
  'Pintura y Arte',
  'Programación Web',
  'Salud y Bienestar',
  'Derecho',
  'Agricultura',
  'Servicios Cloud',
];

export const CoachSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas las especialidades');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [coaches, setCoaches] = useState(mockCoaches);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const handleSearch = () => {
    let filteredCoaches = mockCoaches;

    if (searchQuery) {
      filteredCoaches = filteredCoaches.filter(
        coach =>
          coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coach.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'Todas las especialidades') {
      filteredCoaches = filteredCoaches.filter(coach => coach.specialty === selectedSpecialty);
    }

    if (showOnlyAvailable) {
      filteredCoaches = filteredCoaches.filter(coach => coach.isAvailable);
    }

    setCoaches(filteredCoaches);
  };

  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
  };

  const handleBookSession = (coach: Coach) => {
    console.log(`¡Sesión solicitada con ${coach.name}! El coach será notificado.`);
  };

  if (selectedCoach) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="secondary"
              onClick={() => setSelectedCoach(null)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700"
            >
              ← Volver a búsqueda
            </Button>
            <h1 className="text-3xl font-bold text-white">Perfil del Coach</h1>
          </div>

          {/* Coach Profile */}
          <div className="bg-gray-800 rounded-2xl p-8 mb-6 border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar and Status */}
              <div className="text-center lg:text-left">
                <div className="relative inline-block mb-6">
                  <div className="text-8xl mb-4">{selectedCoach.avatar}</div>
                  <div
                    className={`absolute -bottom-2 -right-2 flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCoach.isAvailable
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        selectedCoach.isAvailable ? 'bg-white' : 'bg-gray-400'
                      }`}
                    />
                    {selectedCoach.isAvailable ? 'Disponible' : 'Ocupado'}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-3">{selectedCoach.name}</h2>
                <p className="text-2xl text-blue-400 mb-6">{selectedCoach.specialty}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 text-xl">⭐</span>
                      <span className="text-xl font-bold text-white">{selectedCoach.rating}</span>
                      <span className="text-gray-400">({selectedCoach.reviewCount} reseñas)</span>
                    </div>
                    <div className="text-gray-300 flex items-center gap-3">
                      <span className="text-lg">📍</span>
                      <span>{selectedCoach.location}</span>
                    </div>
                    <div className="text-gray-300 flex items-center gap-3">
                      <span className="text-lg">⏱️</span>
                      <span>Responde en {selectedCoach.responseTime}</span>
                    </div>
                    <div className="text-gray-300 flex items-center gap-3">
                      <span className="text-lg">🎓</span>
                      <span>{selectedCoach.experience} de experiencia</span>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-600">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      ${selectedCoach.price.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-lg">COP por sesión de 20 min</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="primary"
                    onClick={() => handleBookSession(selectedCoach)}
                    disabled={!selectedCoach.isAvailable}
                    className={`px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3 ${
                      selectedCoach.isAvailable
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedCoach.isAvailable ? '🎥 Conectar Ahora' : 'No Disponible'}
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-8 py-4 text-lg font-semibold rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                  >
                    💬 Enviar Mensaje
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-gray-800 rounded-2xl p-8 mb-6 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Sobre {selectedCoach.name}</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Especialista en {selectedCoach.specialty.toLowerCase()} con {selectedCoach.experience}{' '}
              de experiencia. Ayudo a resolver problemas específicos en sesiones de 20 minutos
              enfocadas y efectivas. Mi enfoque es práctico y directo, buscando siempre dar
              soluciones concretas.
            </p>
          </div>

          {/* Recent Reviews */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Reseñas Recientes</h3>
            <div className="space-y-6">
              <div className="border-b border-gray-700 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-yellow-400 text-lg">⭐⭐⭐⭐⭐</span>
                  <span className="font-semibold text-white text-lg">Juan Carlos</span>
                  <span className="text-gray-400">hace 2 días</span>
                </div>
                <p className="text-gray-300 text-lg">
                  Excelente sesión. Me ayudó a identificar el problema de mi auto en minutos. Muy
                  profesional y directo.
                </p>
              </div>
              <div className="border-b border-gray-700 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-yellow-400 text-lg">⭐⭐⭐⭐⭐</span>
                  <span className="font-semibold text-white text-lg">María López</span>
                  <span className="text-gray-400">hace 1 semana</span>
                </div>
                <p className="text-gray-300 text-lg">
                  Súper recomendado. Resolvió mis dudas rápidamente y me dio consejos prácticos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Encuentra tu Coach Ideal
          </h1>
          <p className="text-xl text-gray-400">
            Conecta con expertos en tiempo real para sesiones de 20 minutos
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-300 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Input
                placeholder="¿Qué necesitas? Ej: 'Mi auto hace ruido'"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg py-4 px-6 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty} className="bg-gray-700">
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl text-lg font-semibold transition-colors"
              >
                🔍 Buscar Coaches
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={e => setShowOnlyAvailable(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300 text-lg">Solo disponibles ahora</span>
            </label>
            <span className="text-gray-400 text-lg font-medium">
              {coaches.length} coaches encontrados
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coaches.map(coach => (
            <div
              key={coach.id}
              onClick={() => handleCoachSelect(coach)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCoachSelect(coach);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-300 dark:border-gray-700 hover:border-blue-500 transition-all cursor-pointer hover:shadow-xl hover:shadow-blue-500/10">
                {/* Coach Card Content */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{coach.avatar}</div>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      coach.isAvailable ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        coach.isAvailable ? 'bg-white' : 'bg-gray-400'
                      }`}
                    />
                    {coach.isAvailable ? 'Disponible' : 'Ocupado'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {coach.name}
                </h3>
                <p className="text-blue-400 text-center mb-6">{coach.specialty}</p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="font-semibold text-white">{coach.rating}</span>
                      <span className="text-gray-400">({coach.reviewCount})</span>
                    </div>
                    <span className="text-gray-400">📍 {coach.location.split(',')[0]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">⏱️ {coach.responseTime}</span>
                    <span className="font-bold text-green-400 text-lg">
                      ${coach.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant={coach.isAvailable ? 'primary' : 'secondary'}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    coach.isAvailable
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  disabled={!coach.isAvailable}
                >
                  {coach.isAvailable ? '🎥 Ver Perfil' : 'Ver Perfil'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {coaches.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold text-white mb-4">No se encontraron coaches</h3>
            <p className="text-gray-400 text-lg">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};
