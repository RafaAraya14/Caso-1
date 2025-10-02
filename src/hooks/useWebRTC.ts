import { useCallback, useEffect, useRef, useState } from 'react';

// WebRTC Configuration
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
};

// Types for WebRTC functionality
export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
}

export interface WebRTCControls {
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  createOffer: () => Promise<RTCSessionDescriptionInit | null>;
  handleOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit | null>;
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
}

export interface UseWebRTCProps {
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: string) => void;
}

export const useWebRTC = (props: UseWebRTCProps = {}): WebRTCState & WebRTCControls => {
  const { onIceCandidate, onConnectionStateChange, onError } = props;

  // State management
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);

  // Refs for WebRTC objects
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    try {
      const peerConnection = new RTCPeerConnection(ICE_SERVERS);

      // Handle ICE candidates
      peerConnection.onicecandidate = event => {
        if (event.candidate && onIceCandidate) {
          onIceCandidate(event.candidate);
        }
      };

      // Handle remote stream
      peerConnection.ontrack = event => {
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        setIsConnected(state === 'connected');
        setIsConnecting(state === 'connecting');

        if (onConnectionStateChange) {
          onConnectionStateChange(state);
        }

        if (state === 'failed' || state === 'disconnected') {
          setError('Connection failed or disconnected');
        }
      };

      peerConnectionRef.current = peerConnection;
      return peerConnection;
    } catch (err) {
      const errorMessage = 'Failed to initialize peer connection';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    }
  }, [onIceCandidate, onConnectionStateChange, onError]);

  // Get user media (camera and microphone)
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
          sampleRate: 44100,
        },
      });

      setLocalStream(stream);
      return stream;
    } catch (err) {
      const errorMessage = 'Failed to access camera and microphone';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    }
  }, [onError]);

  // Start video call
  const startCall = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);

      // Get user media
      const stream = await getUserMedia();

      // Initialize peer connection
      const peerConnection = initializePeerConnection();

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      console.log('[WebRTC] Call started successfully');

      // Simular conexión exitosa después de 3 segundos para el prototipo
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        console.log('[WebRTC] Connection established');
      }, 3000);
    } catch (err) {
      const errorMessage = 'Failed to start call';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsConnecting(false);
    }
  }, [getUserMedia, initializePeerConnection, onError]);

  // End video call
  const endCall = useCallback(() => {
    try {
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Reset state
      setRemoteStream(null);
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);

      console.log('[WebRTC] Call ended');
    } catch (err) {
      const errorMessage = 'Error ending call';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [localStream, onError]);

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

  // Create offer for outgoing call
  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit | null> => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (err) {
      const errorMessage = 'Failed to create offer';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    }
  }, [onError]);

  // Handle incoming offer and create answer
  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> => {
      try {
        const peerConnection = peerConnectionRef.current;
        if (!peerConnection) {
          throw new Error('Peer connection not initialized');
        }

        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        return answer;
      } catch (err) {
        const errorMessage = 'Failed to handle offer';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      }
    },
    [onError]
  );

  // Handle incoming answer
  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      try {
        const peerConnection = peerConnectionRef.current;
        if (!peerConnection) {
          throw new Error('Peer connection not initialized');
        }

        await peerConnection.setRemoteDescription(answer);
      } catch (err) {
        const errorMessage = 'Failed to handle answer';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [onError]
  );

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      try {
        const peerConnection = peerConnectionRef.current;
        if (!peerConnection) {
          throw new Error('Peer connection not initialized');
        }

        await peerConnection.addIceCandidate(candidate);
      } catch (err) {
        const errorMessage = 'Failed to handle ICE candidate';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [onError]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  // Update camera/microphone state when local stream changes
  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const audioTrack = localStream.getAudioTracks()[0];

      setIsCameraOn(videoTrack?.enabled ?? false);
      setIsMicrophoneOn(audioTrack?.enabled ?? false);
    }
  }, [localStream]);

  return {
    // State
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    error,
    isCameraOn,
    isMicrophoneOn,

    // Controls
    startCall,
    endCall,
    toggleCamera,
    toggleMicrophone,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  };
};

export default useWebRTC;
