import React from 'react';

import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

export const CoachProfile = () => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Coach Example</h1>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="ml-1 text-lg font-semibold text-slate-200">4.8</span>
              <span className="ml-2 text-slate-400">Rating</span>
            </div>
          </div>
          <span className="px-4 py-2 bg-green-900/50 text-green-400 rounded-lg border border-green-500/30">
            Disponible
          </span>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-500/30">
                Life Coaching
              </span>
              <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full border border-green-500/30">
                Career Coaching
              </span>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-100 mb-3">Acerca de mí</h2>
            <p className="text-slate-300 leading-relaxed">
              Soy un coach profesional con amplia experiencia ayudando a personas a alcanzar sus
              objetivos. Mi enfoque se basa en metodologías probadas y un acompañamiento
              personalizado.
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-slate-100 mb-3">Información</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Rating:</span>
                <span className="text-slate-200">4.8/5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Especialidades:</span>
                <span className="text-slate-200">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado:</span>
                <span className="text-green-400">Disponible</span>
              </div>
            </div>
          </Card>

          <Card className="bg-blue-950/30 border-blue-500/30">
            <h3 className="font-semibold text-blue-300 mb-2">¿Listo para comenzar?</h3>
            <p className="text-blue-200 text-sm mb-4">
              Agenda una sesión de 20 minutos y comienza tu transformación hoy.
            </p>
            <Button variant="primary" className="w-full">
              Contratar Coach
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
