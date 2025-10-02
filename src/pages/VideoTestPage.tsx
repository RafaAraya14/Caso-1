import React, { useEffect, useRef, useState } from 'react';

/**
 * Página de prueba para el sistema de videollamadas
 * Permite testear permisos, cámara, y funcionalidades WebRTC básicas
 */
export const VideoTestPage: React.FC = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionState, setConnectionState] = useState<string>('Desconectado');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('🚀 Sistema de prueba de videollamadas iniciado');
    addLog('📋 Instrucciones:');
    addLog('1. Hacer clic en "Solicitar Permisos" para autorizar cámara y micrófono');
    addLog('2. Hacer clic en "Iniciar Cámara" para ver tu video');
    addLog('3. Usar los controles para probar funcionalidades');
    addLog('4. Hacer clic en "Test Conexión" para probar WebRTC');
  }, []);

  const requestPermissions = async () => {
    addLog('🔑 Solicitando permisos de cámara y micrófono...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      addLog('✅ Permisos otorgados exitosamente');
      setHasPermissions(true);

      // Detener el stream temporal
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      addLog(`❌ Error al solicitar permisos: ${error.message}`);
      setHasPermissions(false);
    }
  };

  const startCamera = async () => {
    addLog('📹 Iniciando cámara...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCameraActive(true);
      addLog('✅ Cámara iniciada correctamente');
    } catch (error: any) {
      addLog(`❌ Error al iniciar cámara: ${error.message}`);
    }
  };

  const stopCamera = () => {
    addLog('🛑 Deteniendo cámara...');

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setCameraActive(false);
      addLog('✅ Cámara detenida');
    }
  };

  const testConnection = async () => {
    addLog('🔗 Iniciando test de conexión WebRTC...');

    try {
      // Crear peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      peerConnectionRef.current = pc;

      // Eventos de conexión
      pc.oniceconnectionstatechange = () => {
        addLog(`🔄 Estado de ICE: ${pc.iceConnectionState}`);
        setConnectionState(pc.iceConnectionState);
      };

      pc.onconnectionstatechange = () => {
        addLog(`🔄 Estado de conexión: ${pc.connectionState}`);
        setConnectionState(pc.connectionState);
      };

      pc.onicegatheringstatechange = () => {
        addLog(`🔄 Estado de gathering: ${pc.iceGatheringState}`);
      };

      // Agregar tracks si hay stream
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
          addLog(`➕ Track agregado: ${track.kind}`);
        });
      }

      // Crear offer para test
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      addLog('✅ Offer creado exitosamente');
      addLog(`📝 Offer SDP: ${offer.sdp?.substring(0, 100)}...`);
    } catch (error: any) {
      addLog(`❌ Error en test de conexión: ${error.message}`);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        addLog(`🎥 Video ${videoTrack.enabled ? 'activado' : 'desactivado'}`);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        addLog(`🎵 Audio ${audioTrack.enabled ? 'activado' : 'desactivado'}`);
      }
    }
  };

  const clearLog = () => {
    setLogs(['Log limpiado...']);
  };

  return (
    <div className="container mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🎥 Test de Videollamadas</h1>
        <p className="text-gray-300">Prueba el sistema de videollamadas de 20minCoach</p>
      </header>

      {/* Estado de permisos */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📹 Estado de Permisos</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${hasPermissions ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span>Cámara: {hasPermissions ? 'Autorizada' : 'No autorizada'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${hasPermissions ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span>Micrófono: {hasPermissions ? 'Autorizado' : 'No autorizado'}</span>
          </div>
        </div>
      </div>

      {/* Controles de prueba */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🎮 Controles de Prueba</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={requestPermissions}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Solicitar Permisos
          </button>
          <button
            onClick={startCamera}
            disabled={!hasPermissions || cameraActive}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Iniciar Cámara
          </button>
          <button
            onClick={stopCamera}
            disabled={!cameraActive}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Detener Cámara
          </button>
          <button
            onClick={testConnection}
            disabled={!hasPermissions}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Conexión
          </button>
        </div>
      </div>

      {/* Vista de video */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📺 Vista de Video</h2>
        <div className="relative bg-black rounded-lg overflow-hidden h-96">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Información superpuesta */}
          <div className="absolute top-4 left-4 bg-black/70 rounded-lg px-3 py-2">
            <p className="text-sm">Video Local</p>
            <p className={`text-xs ${cameraActive ? 'text-green-400' : 'text-gray-400'}`}>
              {cameraActive ? 'Activo' : 'Detenido'}
            </p>
          </div>

          {/* Estado de conexión */}
          <div className="absolute top-4 right-4 bg-black/70 rounded-lg px-3 py-2">
            <p className="text-sm">Conexión WebRTC</p>
            <p className="text-xs text-blue-400">{connectionState}</p>
          </div>

          {/* Controles superpuestos */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button
              onClick={toggleVideo}
              disabled={!cameraActive}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors disabled:opacity-50"
            >
              📹
            </button>
            <button
              onClick={toggleAudio}
              disabled={!cameraActive}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors disabled:opacity-50"
            >
              🎤
            </button>
          </div>

          {/* Overlay cuando no hay video */}
          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">📹</span>
                </div>
                <p className="text-gray-400">Cámara no iniciada</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log de actividad */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Log de Actividad</h2>
        <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))}
        </div>
        <button
          onClick={clearLog}
          className="mt-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          Limpiar Log
        </button>
      </div>
    </div>
  );
};

export default VideoTestPage;
