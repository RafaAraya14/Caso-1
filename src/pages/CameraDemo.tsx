import React, { useEffect, useRef, useState } from 'react';

/**
 * Demo simple para probar la activación automática de cámara
 */
export const CameraDemo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Auto-activar cámara al cargar (simula entrar a videollamada)
  useEffect(() => {
    let isMounted = true;

    const activateCamera = async () => {
      try {
        console.log('🎥 Activando cámara automáticamente...');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });

        if (isMounted) {
          setStream(mediaStream);
          setIsActive(true);
          setError(null);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }

          console.log('✅ Cámara activada exitosamente');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          setIsActive(false);
          console.error('❌ Error al activar cámara:', err);
        }
      }
    };

    // Activar cámara inmediatamente (simula ingreso a llamada)
    activateCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log(`📹 Cámara ${videoTrack.enabled ? 'activada' : 'desactivada'}`);
      }
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">📹 Demo de Activación Automática de Cámara</h1>
          <p className="text-gray-300">
            Simula exactamente lo que debe pasar al ingresar a una videollamada
          </p>
        </header>

        {/* Estado actual */}
        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-200">📊 Estado Actual</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span
                className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span>Cámara: {isActive ? 'Activa' : 'Inactiva'}</span>
            </div>
            {error && <div className="text-red-400 text-sm">❌ Error: {error}</div>}
          </div>
        </div>

        {/* Video principal */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📺 Tu Video (Activación Automática)</h2>
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center">
                  {error ? (
                    <>
                      <div className="text-6xl mb-4">❌</div>
                      <p className="text-red-400 font-semibold">Error al acceder a la cámara</p>
                      <p className="text-gray-400 text-sm mt-2">{error}</p>
                    </>
                  ) : (
                    <>
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
                      <p className="text-blue-400 font-semibold">Activando cámara...</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Autoriza permisos si aparece la solicitud
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Indicador de estado */}
            <div className="absolute top-4 left-4 bg-black/70 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`}
                />
                <span className="text-sm font-medium">{isActive ? 'EN VIVO' : 'DESCONECTADO'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎮 Controles de Prueba</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={toggleCamera}
              disabled={!isActive}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              📹 Toggle Cámara
            </button>

            <button
              onClick={stopCamera}
              disabled={!isActive}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🛑 Detener Cámara
            </button>

            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              🔄 Reiniciar Demo
            </button>
          </div>
        </div>

        {/* Resultado esperado */}
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-200">✅ Resultado Esperado</h2>
          <div className="text-green-100 space-y-2">
            <p>
              <strong>1.</strong> Al cargar esta página, la cámara debe activarse automáticamente
            </p>
            <p>
              <strong>2.</strong> Debes ver tu video en tiempo real arriba
            </p>
            <p>
              <strong>3.</strong> El indicador debe mostrar &quot;EN VIVO&quot; en verde
            </p>
            <p>
              <strong>4.</strong> Los controles deben permitir toggle y detener la cámara
            </p>
            <p className="mt-4 text-yellow-200">
              <strong>📋 Esto simula exactamente el comportamiento del prototipo</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraDemo;
