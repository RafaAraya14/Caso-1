import React, { useState } from 'react';

import { Button } from '../ui/Button/Button';

interface VideoControlsProps {
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onEndCall: () => void;
  onScreenShare?: () => void;
  onSettings?: () => void;
  className?: string;
}

// Screen sharing capabilities check
const supportsScreenShare = navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices;

export const VideoControls: React.FC<VideoControlsProps> = ({
  isCameraOn,
  isMicrophoneOn,
  onToggleCamera,
  onToggleMicrophone,
  onEndCall,
  onScreenShare,
  onSettings,
  className = '',
}) => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleScreenShare = async () => {
    if (!supportsScreenShare || !onScreenShare) {
      return;
    }

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Handle when user stops sharing from browser
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
        });

        setIsScreenSharing(true);
        onScreenShare();
      } else {
        // Stop screen sharing
        setIsScreenSharing(false);
        onScreenShare();
      }
    } catch (error) {
      console.error('Error with screen sharing:', error);
    }
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
    if (onSettings) {
      onSettings();
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Main controls row */}
      <div className="flex items-center justify-center space-x-4">
        {/* Microphone toggle */}
        <Button
          onClick={onToggleMicrophone}
          variant={isMicrophoneOn ? 'secondary' : 'ghost'}
          size="lg"
          className={`h-14 w-14 rounded-full p-0 ${
            !isMicrophoneOn ? 'bg-red-600 hover:bg-red-700' : ''
          }`}
          data-testid="microphone-toggle"
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
          onClick={onToggleCamera}
          variant={isCameraOn ? 'secondary' : 'ghost'}
          size="lg"
          className={`h-14 w-14 rounded-full p-0 ${
            !isCameraOn ? 'bg-red-600 hover:bg-red-700' : ''
          }`}
          data-testid="camera-toggle"
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

        {/* Screen share toggle */}
        {supportsScreenShare && onScreenShare && (
          <Button
            onClick={handleScreenShare}
            variant={isScreenSharing ? 'primary' : 'secondary'}
            size="lg"
            className="h-14 w-14 rounded-full p-0"
            data-testid="screen-share-toggle"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-2 0V5H5v10h4a1 1 0 110 2H4a1 1 0 01-1-1V4zm7.707 5.707a1 1 0 00-1.414-1.414L8 9.586V8a1 1 0 00-2 0v4a1 1 0 001 1h4a1 1 0 100-2H9.414l1.293-1.293z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        )}

        {/* Settings */}
        {onSettings && (
          <Button
            onClick={handleSettings}
            variant="secondary"
            size="lg"
            className="h-14 w-14 rounded-full p-0"
            data-testid="settings-toggle"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        )}

        {/* End call button */}
        <Button
          onClick={onEndCall}
          variant="ghost"
          size="lg"
          className="h-14 w-14 rounded-full p-0 bg-red-600 hover:bg-red-700"
          data-testid="end-call-button"
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

      {/* Status indicators */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${isMicrophoneOn ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span>{isMicrophoneOn ? 'Audio ON' : 'Audio OFF'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isCameraOn ? 'Video ON' : 'Video OFF'}</span>
        </div>
        {isScreenSharing && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Compartiendo pantalla</span>
          </div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-gray-800 rounded-lg p-4 mx-4">
          <h3 className="text-lg font-semibold mb-4 text-white">Configuración de video</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Calidad de video</span>
              <select className="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                <option value="720p">720p HD</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Micrófono</span>
              <select className="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                <option value="default">Predeterminado</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Cámara</span>
              <select className="bg-gray-700 text-white rounded px-3 py-1 text-sm">
                <option value="default">Predeterminada</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoControls;
