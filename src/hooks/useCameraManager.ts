import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraManagerReturn {
  localStream: MediaStream | null;
  isCameraOn: boolean;
  cameraError: string | null;
  requestCameraAccess: () => Promise<MediaStream | null>;
  toggleCamera: () => Promise<void>;
  cleanupStream: () => void;
}

export const useCameraManager = (): CameraManagerReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setLocalStream(null);
    setIsCameraOn(false);
  }, []);

  const requestCameraAccess = useCallback(async (): Promise<MediaStream | null> => {
    try {
      setCameraError(null);
      cleanupStream();

      await new Promise(resolve => setTimeout(resolve, 200));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: { echoCancellation: true },
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No se pudo obtener video');
      }

      streamRef.current = stream;
      setLocalStream(stream);
      setIsCameraOn(true);
      return stream;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      setCameraError(`Error: ${msg}`);
      cleanupStream();
      return null;
    }
  }, [cleanupStream]);

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      cleanupStream();
    } else {
      await requestCameraAccess();
    }
  }, [isCameraOn, cleanupStream, requestCameraAccess]);

  useEffect(() => cleanupStream, [cleanupStream]);

  return {
    localStream,
    isCameraOn,
    cameraError,
    requestCameraAccess,
    toggleCamera,
    cleanupStream,
  };
};
