import React, { useState } from 'react';

import { Button } from '../components/ui/Button/Button';
import { VideoCall } from '../components/video';

import type { Coach } from '../types/coach';

/**
 * Página de test para verificar que la cámara se active automáticamente
 * al ingresar a una videollamada
 */
export const CameraTestPage: React.FC = () => {
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  // Coach de prueba
  const mockCoach: Coach = {
    id: 999,
    userId: 'test-user-999',
    displayname: 'Coach de Prueba',
    specialties: 'Testing',
    rating: 5.0,
    city: 'Virtual',
    country: 'Testing',
    status: 'Disponible',
    reviewsCount: 0,
    bio: 'Coach para testing de videollamadas',
    avatarColor: 'text-blue-500',
    profileimage: '/placeholder-avatar.jpg',
    reviews: [],
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const startVideoCallTest = () => {
    addLog('🚀 Iniciando test de ingreso a videollamada...');
    addLog('📋 Verificando: La cámara debe activarse automáticamente');
    addLog('⚠️ IMPORTANTE: Autoriza permisos cuando el navegador los solicite');
    setShowVideoCall(true);
  };

  const endVideoCallTest = () => {
    addLog('📞 Finalizando test de videollamada');
    addLog('✅ Test completado - cámara debe haberse desactivado');
    setShowVideoCall(false);
  };

  const clearLogs = () => {
    setTestLogs(['Test reiniciado...']);
  };

  if (showVideoCall) {
    return (
      <VideoCall
        coach={mockCoach}
        onEndCall={endVideoCallTest}
        onSessionComplete={endVideoCallTest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">🎥 Test de Activación Automática de Cámara</h1>
          <p className="text-gray-300">
            Verifica que la cámara se active automáticamente al ingresar a una videollamada
          </p>
        </header>

        {/* Instrucciones */}
        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-200">📋 Instrucciones del Test</h2>
          <ol className="space-y-2 text-blue-100">
            <li>
              <strong>1.</strong> Hacer clic en &quot;Iniciar Videollamada de Prueba&quot;
            </li>
            <li>
              <strong>2.</strong> Autorizar permisos de cámara y micrófono cuando el navegador los
              solicite
            </li>
            <li>
              <strong>3.</strong> Verificar que tu video aparece automáticamente en la esquina
              superior derecha
            </li>
            <li>
              <strong>4.</strong> Probar los controles (cámara, micrófono)
            </li>
            <li>
              <strong>5.</strong> Finalizar la llamada y verificar que todo se limpia correctamente
            </li>
          </ol>
        </div>

        {/* Criterios de éxito */}
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-200">✅ Criterios de Éxito</h2>
          <ul className="space-y-2 text-green-100">
            <li>• La cámara se activa automáticamente sin intervención manual</li>
            <li>• El video aparece en tiempo real en el área &quot;Tu video&quot;</li>
            <li>• Los controles de cámara y micrófono funcionan correctamente</li>
            <li>• Al finalizar la llamada, todos los recursos se liberan</li>
            <li>• No hay errores en la consola del navegador</li>
          </ul>
        </div>

        {/* Controles */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={startVideoCallTest}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold"
            >
              🚀 Iniciar Videollamada de Prueba
            </Button>

            <Button onClick={clearLogs} variant="secondary" className="px-6 py-3">
              🗑️ Limpiar Logs
            </Button>
          </div>
        </div>

        {/* Log de actividad */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Log de Test</h2>
          <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
            {testLogs.length > 0 ? (
              testLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-400">Esperando inicio del test...</div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-yellow-900/50 border border-yellow-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-200">💡 Información Técnica</h2>
          <div className="text-yellow-100 space-y-2">
            <p>
              <strong>Tecnología:</strong> WebRTC con getUserMedia API
            </p>
            <p>
              <strong>Resolución:</strong> 1280x720 (HD)
            </p>
            <p>
              <strong>Compatibilidad:</strong> Chrome, Firefox, Safari, Edge modernos
            </p>
            <p>
              <strong>Permisos:</strong> Se solicitan automáticamente al iniciar la llamada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraTestPage;
