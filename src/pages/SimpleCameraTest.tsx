import React, { useEffect, useRef, useState } from 'react';

/**
 * Test simple para verificar la activación automática de cámara
 */
export const SimpleCameraTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      console.log('🚀 Solicitando acceso a cámara...');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      console.log('✅ Cámara activada exitosamente');
    } catch (err: any) {
      const errorMessage = `Error: ${err.message}`;
      setError(errorMessage);
      setIsActive(false);
      console.error('❌ Error de cámara:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      console.log('🛑 Cámara detenida');
    }
  };

  // Auto-iniciar al montar (simula ingreso a videollamada)
  useEffect(() => {
    console.log('🎬 Componente montado - iniciando cámara automáticamente...');
    startCamera();

    // Cleanup al desmontar
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Dependencias vacías para ejecutar solo al montar

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">📹 Test Simple de Cámara</h1>
          <p className="text-gray-300">Verifica que la cámara se active automáticamente</p>
        </header>

        {/* Estado */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Estado Actual</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div
                className={`w-4 h-4 rounded-full mx-auto mb-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <p className="text-sm">Cámara: {isActive ? 'Activa' : 'Inactiva'}</p>
            </div>
            <div className="text-center">
              <div
                className={`w-4 h-4 rounded-full mx-auto mb-2 ${stream ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <p className="text-sm">Stream: {stream ? 'Conectado' : 'Desconectado'}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-200 text-sm">🚨 {error}</p>
            </div>
          )}
        </div>

        {/* Video Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📺 Vista de Video</h2>
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ display: isActive ? 'block' : 'none' }}
            />

            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">📹</span>
                  </div>
                  <p className="text-gray-400">
                    {error ? 'Error al acceder a cámara' : 'Cámara no activada'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🎮 Controles</h2>
          <div className="flex gap-4 justify-center">
            <button
              onClick={startCamera}
              disabled={isActive}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🚀 Iniciar Cámara
            </button>

            <button
              onClick={stopCamera}
              disabled={!isActive}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🛑 Detener Cámara
            </button>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-8 bg-blue-900/50 border border-blue-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-200">📋 Qué Esperar</h2>
          <ul className="space-y-2 text-blue-100">
            <li>• Al cargar esta página, la cámara debe activarse automáticamente</li>
            <li>• El navegador pedirá permisos - debes autorizarlos</li>
            <li>• Tu video debe aparecer inmediatamente en el área negra</li>
            <li>• Los controles deben funcionar para encender/apagar</li>
            <li>• Esto simula exactamente lo que pasa al entrar a una videollamada</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleCameraTest;
