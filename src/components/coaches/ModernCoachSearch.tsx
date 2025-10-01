import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { mockCoachesData, type Coach } from '../../types/coach';
import { ThemeToggle } from '../ui/ThemeToggle';

interface ModernCoachSearchProps {
  onCoachSelect?: (coach: Coach) => void;
  onShowSubscriptions?: () => void;
  onLogout?: () => void;
  user?: { email: string };
}

const ModernCoachSearch: React.FC<ModernCoachSearchProps> = ({
  onCoachSelect,
  onShowSubscriptions,
  onLogout,
}) => {
  const [coaches] = useState<Coach[]>(mockCoachesData);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>(mockCoachesData);
  const [searchText, setSearchText] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const navigate = useNavigate();

  // Especialidades únicas para el filtro
  const specialties = Array.from(new Set(coaches.map(coach => coach.specialties)));

  // Efecto para filtrar coaches
  useEffect(() => {
    let filtered = coaches;

    // Filtrar por texto de búsqueda
    if (searchText) {
      filtered = filtered.filter(
        coach =>
          coach.displayname.toLowerCase().includes(searchText.toLowerCase()) ||
          coach.specialties.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtrar por especialidad
    if (selectedSpecialty) {
      filtered = filtered.filter(coach => coach.specialties === selectedSpecialty);
    }

    // Filtrar solo disponibles
    if (availableOnly) {
      filtered = filtered.filter(coach => coach.status === 'Disponible');
    }

    setFilteredCoaches(filtered);
  }, [searchText, selectedSpecialty, availableOnly, coaches]);

  const handleSearch = () => {
    // La búsqueda se hace automáticamente con useEffect
    console.log('Búsqueda ejecutada');
  };

  const handleCoachClick = (coach: Coach) => {
    if (coach.status === 'Disponible') {
      if (onCoachSelect) {
        onCoachSelect(coach);
      } else {
        // Navegar al perfil del coach
        navigate(`/coach/${coach.id}`);
      }
    }
  };

  const renderCoachCard = (coach: Coach) => {
    const isAvailable = coach.status === 'Disponible';

    return (
      <div
        key={coach.id}
        className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-2xl p-6 flex flex-col text-center items-center ${
          isAvailable
            ? 'transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer'
            : 'opacity-60'
        }`}
        onClick={() => handleCoachClick(coach)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCoachClick(coach);
          }
        }}
        role="button"
        tabIndex={isAvailable ? 0 : -1}
        aria-label={`Ver perfil de ${coach.displayname}`}
      >
        <div className="relative mb-4">
          <i className={`fas fa-user-circle text-6xl ${coach.avatarColor}`} />
          <span
            className={`absolute bottom-0 right-0 block h-5 w-5 ${
              isAvailable ? 'bg-green-500' : 'bg-slate-500'
            } border-2 border-white dark:border-slate-800 rounded-full`}
          />
        </div>

        <span
          className={`${
            isAvailable
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
          } text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2`}
        >
          {coach.status}
        </span>

        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{coach.displayname}</h3>

        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{coach.specialties}</p>

        <div className="w-full border-t border-slate-200 dark:border-slate-700 my-4" />

        <div className="flex justify-between w-full text-sm text-slate-600 dark:text-slate-300 mb-6">
          <span>
            <i className="fas fa-star text-yellow-400" /> {coach.rating} ({coach.reviewsCount})
          </span>
          <span>
            <i className="fas fa-map-marker-alt text-red-500" /> {coach.city}
          </span>
        </div>

        <button
          className={`w-full mt-auto ${
            isAvailable
              ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
              : 'bg-slate-400 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105`}
          disabled={!isAvailable}
        >
          Ver Perfil
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans gradient-bg">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none z-30 flex items-center justify-center"
      >
        <i className="fas fa-sign-out-alt text-lg" />
      </button>

      <div className="container mx-auto p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              {/* Logo SVG */}
              <svg className="w-12 h-12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradSearch1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a5b4fc" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="gradSearch2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f9a8d4" />
                    <stop offset="100%" stopColor="#be185d" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="url(#gradSearch1)"
                  strokeWidth="4"
                />
                <path
                  d="M25 50 C 35 30, 65 30, 75 50 C 65 70, 35 70, 25 50 Z"
                  stroke="url(#gradSearch2)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle cx="50" cy="50" r="10" fill="url(#gradSearch1)" />
              </svg>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                20min<span className="text-indigo-600">Coach</span>
              </h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white">
              Encuentra tu Coach Ideal
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Conecta con expertos en tiempo real.
            </p>
          </div>

          {/* Subscriptions Button */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={onShowSubscriptions}
              className="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none flex items-center transition-all duration-300 font-semibold"
            >
              <i className="fas fa-gem mr-2 text-indigo-600" />
              <span>Mis Planes</span>
            </button>
          </div>

          {/* Search Panel */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Search Input */}
              <div className="relative col-span-12 md:col-span-5">
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Busca por especialidad o nombre..."
                  className="w-full bg-slate-100 dark:bg-slate-700/50 border-2 border-slate-300 dark:border-slate-700 rounded-lg py-3 pl-4 pr-12 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 focus:border-indigo-600 transition-colors"
                />
                <button className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-500 hover:text-indigo-600">
                  <i className="fas fa-microphone text-xl" />
                </button>
              </div>

              {/* Specialty Filter */}
              <div className="col-span-12 md:col-span-3">
                <select
                  value={selectedSpecialty}
                  onChange={e => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-700/50 border-2 border-slate-300 dark:border-slate-700 rounded-lg py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 focus:border-indigo-600 transition-colors"
                >
                  <option value="">Todas las Especialidades</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="col-span-12 md:col-span-4">
                <button
                  onClick={handleSearch}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 flex items-center justify-center transform hover:scale-105"
                >
                  <i className="fas fa-search mr-2" />
                  Buscar
                </button>
              </div>
            </div>

            {/* Filters and Count */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="flex items-center">
                <input
                  id="available-now"
                  type="checkbox"
                  checked={availableOnly}
                  onChange={e => setAvailableOnly(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-600 border-gray-300 dark:border-gray-600 bg-slate-200 dark:bg-slate-700"
                />
                <label htmlFor="available-now" className="ml-2 text-slate-600 dark:text-slate-300">
                  Solo disponibles ahora
                </label>
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {filteredCoaches.length} coaches encontrados
              </span>
            </div>
          </div>

          {/* Coaches Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCoaches.map(renderCoachCard)}
          </div>

          {/* No results message */}
          {filteredCoaches.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-search text-4xl text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No se encontraron coaches
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernCoachSearch;
