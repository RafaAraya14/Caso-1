import React, { useEffect, useRef, useState } from 'react';

const CameraDebug: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Iniciando...');

  const testCamera = async () => {
    try {
      setError(null);
      setStatus('Solicitando permisos...');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStatus('Permisos obtenidos. Configurando video...');
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStatus('Video configurado. Intentando reproducir...');

        try {
          await videoRef.current.play();
          setStatus('¡Cámara funcionando!');
        } catch (playError) {
          setStatus('Error al reproducir video');
          setError(`Play error: ${playError}`);
        }
      }
    } catch (err) {
      setError(`Error: ${err}`);
      setStatus('Error obteniendo cámara');
    }
  };

  useEffect(() => {
    testCamera();
  }, []);

  const retryCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    testCamera();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Debug de Cámara</h1>

      <div className="mb-4">
        <p className="text-lg">
          Estado: <span className="text-blue-400">{status}</span>
        </p>
        {error && <p className="text-red-400 mt-2">Error: {error}</p>}
      </div>

      <div className="mb-6">
        <button onClick={retryCamera} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
          Reintentar Cámara
        </button>
      </div>

      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md"
          style={{ backgroundColor: '#1e293b' }}
        />
      </div>

      <div className="mt-4 text-sm text-slate-400">
        <p>Stream activo: {stream ? 'Sí' : 'No'}</p>
        <p>Video tracks: {stream?.getVideoTracks().length || 0}</p>
        <p>Audio tracks: {stream?.getAudioTracks().length || 0}</p>
      </div>
    </div>
  );
};

export default CameraDebug;
