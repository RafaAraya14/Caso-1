import React, { useEffect, useRef } from 'react';

import useWebRTC, { type UseWebRTCProps } from '../../hooks/useWebRTCWithSignaling';
import { Button } from '../ui/Button/Button';

interface VideoCallProps extends UseWebRTCProps {
  sessionId: string;
  userId: string;
  onCallEnd?: () => void;
  className?: string;
}

// Subcomponent for connection status
const ConnectionStatus: React.FC<{
  isConnecting: boolean;
  isConnected: boolean;
}> = ({ isConnecting, isConnected }) => {
  if (isConnecting) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        <span className="text-sm">Conectando...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm">Conectado</span>
      </div>
    );
  }

  return null;
};

// Subcomponent for remote video area
const RemoteVideoArea: React.FC<{
  remoteStream: MediaStream | null;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
}> = ({ remoteStream, remoteVideoRef }) => {
  if (remoteStream) {
    return (
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover">
        <track kind="captions" />
      </video>
    );
  }

  return (
    <div className="text-center">
      <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="text-gray-400">Esperando al coach...</p>
    </div>
  );
};

// Subcomponent for local video (PiP)
const LocalVideoArea: React.FC<{
  localStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  isCameraOn: boolean;
}> = ({ localStream, localVideoRef, isCameraOn }) => {
  if (localStream) {
    return (
      <>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isCameraOn ? 'opacity-0' : ''}`}
        />
        {!isCameraOn && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0017 14V5a2 2 0 00-2-2H5.414l-1.707-1.707zM5.414 5H15v9.586l-9.586-9.586z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};

export const VideoCall: React.FC<VideoCallProps> = ({
  sessionId,
  userId,
  onCallEnd,
  className = '',
  ...webRTCProps
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
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
  } = useWebRTC(webRTCProps);

  // Set video streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto-start call when component mounts
  useEffect(() => {
    startCall(sessionId, userId);
  }, [startCall, sessionId, userId]);

  const handleEndCall = () => {
    endCall();
    onCallEnd?.();
  };

  return (
    <div className={`flex flex-col h-screen bg-gray-900 text-white ${className}`}>
      {/* Header with session info */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div>
          <h2 className="text-lg font-semibold">Sesión de Coaching</h2>
          <p className="text-sm text-gray-400">ID: {sessionId}</p>
        </div>
        <ConnectionStatus isConnecting={isConnecting} isConnected={isConnected} />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-600 text-white p-3 text-center">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Video container */}
      <div className="flex-1 relative">
        {/* Remote video (main view) */}
        <div className="w-full h-full bg-black flex items-center justify-center">
          <RemoteVideoArea remoteStream={remoteStream} remoteVideoRef={remoteVideoRef} />
        </div>

        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-gray-600">
          <LocalVideoArea
            localStream={localStream}
            localVideoRef={localVideoRef}
            isCameraOn={isCameraOn}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-800">
        <div className="flex items-center justify-center space-x-4">
          {/* Microphone toggle */}
          <Button
            onClick={toggleMicrophone}
            variant={isMicrophoneOn ? 'secondary' : 'ghost'}
            size="lg"
            data-testid="microphone-toggle"
            className={`h-14 w-14 rounded-full p-0 ${
              !isMicrophoneOn ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            {isMicrophoneOn ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 1.414L15.657 9.17a1 1 0 11-1.414-1.414l1.414-1.413zm2.829 2.829a1 1 0 010 1.414l-2.474 2.474a1 1 0 11-1.414-1.414L16.072 9.17a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </Button>

          {/* Camera toggle */}
          <Button
            onClick={toggleCamera}
            variant={isCameraOn ? 'secondary' : 'ghost'}
            size="lg"
            data-testid="camera-toggle"
            className={`h-14 w-14 rounded-full p-0 ${
              !isCameraOn ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            {isCameraOn ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0017 14V5a2 2 0 00-2-2H5.414l-1.707-1.707zM5.414 5H15v9.586l-9.586-9.586z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </Button>

          {/* End call button */}
          <Button
            onClick={handleEndCall}
            variant="ghost"
            size="lg"
            data-testid="end-call-button"
            className="h-14 w-14 rounded-full p-0 bg-red-600 hover:bg-red-700"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>

        {/* Additional controls row */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <p className="text-sm text-gray-400">
            {(() => {
              if (isConnected) {
                return 'Llamada activa';
              }
              if (isConnecting) {
                return 'Conectando...';
              }
              return 'Desconectado';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
