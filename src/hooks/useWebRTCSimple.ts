import { useCallback, useEffect, useState } from 'react';

// Simple WebRTC hook for prototype without signaling complexity
export interface SimpleWebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
}

export interface SimpleWebRTCControls {
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
}

export interface UseSimpleWebRTCProps {
  onConnectionStateChange?: (state: string) => void;
  onError?: (error: string) => void;
}

export const useSimpleWebRTC = (
  props: UseSimpleWebRTCProps = {}
): SimpleWebRTCState & SimpleWebRTCControls => {
  const { onConnectionStateChange, onError } = props;

  // State management
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);

  // Get user media
  const getUserMedia = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setLocalStream(stream);
      return stream;
    } catch (err) {
      const errorMessage = 'No se pudo acceder a la cámara y micrófono';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    }
  }, [onError]);

  // Start video call - simple version for prototype
  const startCall = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);
      onConnectionStateChange?.('connecting');

      // Get user media
      await getUserMedia();

      // Simulate connection establishment after 3 seconds
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        onConnectionStateChange?.('connected');
        console.log('[WebRTC Simple] Connection established');
      }, 3000);

      console.log('[WebRTC Simple] Call started successfully');
    } catch (err) {
      const errorMessage = 'Error al iniciar la llamada';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsConnecting(false);
      onConnectionStateChange?.('failed');
    }
  }, [getUserMedia, onConnectionStateChange, onError]);

  // End video call
  const endCall = useCallback(() => {
    try {
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Reset state
      setRemoteStream(null);
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
      setIsCameraOn(true);
      setIsMicrophoneOn(true);

      onConnectionStateChange?.('disconnected');
      console.log('[WebRTC Simple] Call ended');
    } catch (err) {
      const errorMessage = 'Error al finalizar la llamada';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [localStream, onConnectionStateChange, onError]);

  // Toggle camera on/off
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle microphone on/off
  const toggleMicrophone = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicrophoneOn(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    error,
    isCameraOn,
    isMicrophoneOn,
    startCall,
    endCall,
    toggleCamera,
    toggleMicrophone,
  };
};
