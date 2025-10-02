import { useCallback, useEffect, useRef, useState } from 'react';

import webRTCSignaling, { type SignalingMessage } from '../services/webRTCSignaling';

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
  remoteUserId: string | null;
}

export interface WebRTCControls {
  startCall: (sessionId: string, userId: string) => Promise<void>;
  endCall: () => void;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
}

export interface UseWebRTCProps {
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: string) => void;
  onRemoteUserJoined?: (userId: string) => void;
  onRemoteUserLeft?: (userId: string) => void;
}

export const useWebRTC = (props: UseWebRTCProps = {}): WebRTCState & WebRTCControls => {
  const { onConnectionStateChange, onError, onRemoteUserJoined, onRemoteUserLeft } = props;

  // State management
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);

  // Refs for WebRTC objects
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);
  const isInitiatorRef = useRef<boolean>(false);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    try {
      const peerConnection = new RTCPeerConnection(ICE_SERVERS);

      // Handle ICE candidates
      peerConnection.onicecandidate = event => {
        if (event.candidate && remoteUserId) {
          webRTCSignaling.sendIceCandidate(event.candidate, remoteUserId);
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
  }, [remoteUserId, onConnectionStateChange, onError]);

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

  // End video call
  const endCall = useCallback(() => {
    try {
      // Send call end signal
      if (remoteUserId && currentSessionIdRef.current && currentUserIdRef.current) {
        webRTCSignaling.sendCallEnd(remoteUserId);
      }

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

      // Leave signaling session
      webRTCSignaling.leaveSession();

      // Reset state
      setRemoteStream(null);
      setRemoteUserId(null);
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
      isInitiatorRef.current = false;
      currentSessionIdRef.current = null;
      currentUserIdRef.current = null;

      console.log('[WebRTC] Call ended');
    } catch (err) {
      const errorMessage = 'Error ending call';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [localStream, remoteUserId, onError]);

  // Handle signaling messages
  const handleSignalingMessage = useCallback(
    async (message: SignalingMessage) => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        return;
      }

      try {
        switch (message.type) {
          case 'offer':
            // Received an offer from remote peer
            if (message.data && 'type' in message.data) {
              await peerConnection.setRemoteDescription(message.data as RTCSessionDescriptionInit);
              const answer = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answer);
              await webRTCSignaling.sendAnswer(answer, message.from);
              setRemoteUserId(message.from);
            }
            break;

          case 'answer':
            // Received an answer from remote peer
            if (message.data && 'type' in message.data) {
              await peerConnection.setRemoteDescription(message.data as RTCSessionDescriptionInit);
              setRemoteUserId(message.from);
            }
            break;

          case 'ice-candidate':
            // Received an ICE candidate from remote peer
            if (message.data && 'candidate' in message.data) {
              const candidate = new RTCIceCandidate(message.data as RTCIceCandidateInit);
              await peerConnection.addIceCandidate(candidate);
            }
            break;

          case 'call-end':
            // Remote user ended the call
            endCall();
            break;
        }
      } catch (err) {
        console.error('[WebRTC] Error handling signaling message:', err);
        setError('Error processing signaling message');
      }
    },
    [endCall]
  );

  // Start video call
  const startCall = useCallback(
    async (sessionId: string, userId: string) => {
      try {
        setError(null);
        setIsConnecting(true);

        currentSessionIdRef.current = sessionId;
        currentUserIdRef.current = userId;

        // Join signaling session
        await webRTCSignaling.joinSession(sessionId, userId);

        // Set up signaling event handlers
        webRTCSignaling.onMessage(handleSignalingMessage);

        webRTCSignaling.onUserJoined(joinedUserId => {
          console.log('[WebRTC] User joined:', joinedUserId);
          setRemoteUserId(joinedUserId);
          onRemoteUserJoined?.(joinedUserId);

          // If we're the first user, we become the initiator
          if (!isInitiatorRef.current) {
            isInitiatorRef.current = true;
          }
        });

        webRTCSignaling.onUserLeft(leftUserId => {
          console.log('[WebRTC] User left:', leftUserId);
          if (leftUserId === remoteUserId) {
            setRemoteUserId(null);
            setRemoteStream(null);
          }
          onRemoteUserLeft?.(leftUserId);
        });

        // Get user media
        const stream = await getUserMedia();

        // Initialize peer connection
        const peerConnection = initializePeerConnection();

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // If there's already a remote user, initiate the call
        setTimeout(async () => {
          if (remoteUserId && isInitiatorRef.current) {
            try {
              const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
              });
              await peerConnection.setLocalDescription(offer);
              await webRTCSignaling.sendOffer(offer, remoteUserId);
            } catch (err) {
              console.error('[WebRTC] Error creating offer:', err);
            }
          }
        }, 1000);

        // Simular conexión exitosa para el prototipo después de 3 segundos
        setTimeout(() => {
          setIsConnecting(false);
          setIsConnected(true);
          console.log('[WebRTC] Connection established (prototype simulation)');
        }, 3000);

        console.log('[WebRTC] Call started successfully');
      } catch (err) {
        const errorMessage = 'Failed to start call';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsConnecting(false);
      }
    },
    [
      handleSignalingMessage,
      getUserMedia,
      initializePeerConnection,
      remoteUserId,
      onRemoteUserJoined,
      onRemoteUserLeft,
      onError,
    ]
  );

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
    remoteUserId,

    // Controls
    startCall,
    endCall,
    toggleCamera,
    toggleMicrophone,
  };
};

export default useWebRTC;
