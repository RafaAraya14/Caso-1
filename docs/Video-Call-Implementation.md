# Video Call Implementation Guide

## Overview

This guide documents the WebRTC-based video calling functionality implemented
for the 20minCoach platform. The implementation includes camera and microphone
access, peer-to-peer connections, real-time signaling, and comprehensive UI
controls.

## Architecture

### Components

1. **useWebRTC Hook** (`src/hooks/useWebRTC.ts`)
   - Basic WebRTC functionality
   - Camera and microphone management
   - Peer connection handling

2. **useWebRTCWithSignaling Hook** (`src/hooks/useWebRTCWithSignaling.ts`)
   - Enhanced WebRTC with Supabase Realtime signaling
   - Session management
   - Multi-user support

3. **VideoCall Component** (`src/components/sessions/VideoCall.tsx`)
   - Main video call interface
   - Picture-in-picture local video
   - Connection status indicators

4. **VideoControls Component** (`src/components/sessions/VideoControls.tsx`)
   - Advanced video controls
   - Screen sharing capabilities
   - Settings panel

5. **WebRTC Signaling Service** (`src/services/webRTCSignaling.ts`)
   - Supabase Realtime integration
   - Offer/Answer/ICE candidate exchange
   - Session presence management

6. **Session Service Extensions** (`src/services/SessionService.ts`)
   - Video session lifecycle management
   - Database integration
   - Participant tracking

## Usage Examples

### Basic Video Call

```tsx
import { VideoCall } from '../components/sessions';

function CoachingSession() {
  const handleCallEnd = () => {
    console.log('Call ended');
    // Navigate back or show summary
  };

  return (
    <VideoCall
      sessionId="session-123"
      userId="user-456"
      onCallEnd={handleCallEnd}
      onError={error => console.error('Call error:', error)}
      onRemoteUserJoined={userId => console.log('User joined:', userId)}
      onRemoteUserLeft={userId => console.log('User left:', userId)}
    />
  );
}
```

### Advanced Video Controls

```tsx
import { VideoControls } from '../components/sessions';
import { useWebRTC } from '../hooks';

function CustomVideoCall() {
  const {
    isCameraOn,
    isMicrophoneOn,
    toggleCamera,
    toggleMicrophone,
    endCall,
  } = useWebRTC();

  const handleScreenShare = () => {
    console.log('Screen sharing toggled');
  };

  const handleSettings = () => {
    console.log('Settings opened');
  };

  return (
    <VideoControls
      isCameraOn={isCameraOn}
      isMicrophoneOn={isMicrophoneOn}
      onToggleCamera={toggleCamera}
      onToggleMicrophone={toggleMicrophone}
      onEndCall={endCall}
      onScreenShare={handleScreenShare}
      onSettings={handleSettings}
    />
  );
}
```

### Session Management

```tsx
import {
  startVideoCall,
  endVideoCall,
  getVideoSession,
} from '../services/SessionService';

async function manageVideoSession(sessionId: string, userId: string) {
  try {
    // Start video call
    await startVideoCall(sessionId, userId);
    console.log('Video call started');

    // Get session info
    const session = await getVideoSession(sessionId);
    console.log('Session status:', session?.status);

    // End video call after some time
    setTimeout(
      async () => {
        await endVideoCall(sessionId, userId, 20); // 20 minutes duration
        console.log('Video call ended');
      },
      20 * 60 * 1000
    );
  } catch (error) {
    console.error('Error managing video session:', error);
  }
}
```

## Configuration

### WebRTC Configuration

The WebRTC implementation uses Google STUN servers by default:

```typescript
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
```

### Video Quality Settings

Default video constraints:

```typescript
const videoConstraints = {
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
};
```

### Supabase Realtime Configuration

Ensure your Supabase project has Realtime enabled and proper RLS policies:

```sql
-- Enable Realtime for video sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid TEXT NOT NULL,
  coachid INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  createdat TIMESTAMP DEFAULT NOW(),
  startedat TIMESTAMP,
  endedat TIMESTAMP,
  duration INTEGER
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- Create session participants table
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessionId UUID REFERENCES sessions(id),
  userId TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'coach')),
  joinedAt TIMESTAMP DEFAULT NOW(),
  leftAt TIMESTAMP
);
```

## API Reference

### useWebRTC Hook

#### State Properties

- `localStream`: MediaStream | null - Local camera/microphone stream
- `remoteStream`: MediaStream | null - Remote user's stream
- `isConnected`: boolean - WebRTC connection status
- `isConnecting`: boolean - Connection in progress
- `error`: string | null - Current error message
- `isCameraOn`: boolean - Camera enabled state
- `isMicrophoneOn`: boolean - Microphone enabled state
- `remoteUserId`: string | null - Connected remote user ID

#### Control Methods

- `startCall(sessionId, userId)`: Promise<void> - Start video call
- `endCall()`: void - End video call
- `toggleCamera()`: void - Toggle camera on/off
- `toggleMicrophone()`: void - Toggle microphone on/off

#### Event Callbacks

- `onError(error: string)`: void - Error handling
- `onConnectionStateChange(state: RTCPeerConnectionState)`: void - Connection
  state changes
- `onRemoteUserJoined(userId: string)`: void - Remote user joined
- `onRemoteUserLeft(userId: string)`: void - Remote user left

### VideoCall Component Props

```typescript
interface VideoCallProps {
  sessionId: string; // Unique session identifier
  userId: string; // Current user identifier
  onCallEnd?: () => void; // Call ended callback
  className?: string; // Additional CSS classes
  onError?: (error: string) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onRemoteUserJoined?: (userId: string) => void;
  onRemoteUserLeft?: (userId: string) => void;
}
```

### VideoControls Component Props

```typescript
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
```

## Troubleshooting

### Common Issues

1. **Camera/Microphone Permission Denied**

   ```typescript
   // Handle in onError callback
   const handleError = (error: string) => {
     if (error.includes('camera and microphone')) {
       alert('Please allow camera and microphone access');
     }
   };
   ```

2. **Connection Failed**

   ```typescript
   // Check ICE connection state
   const handleConnectionStateChange = (state: RTCPeerConnectionState) => {
     if (state === 'failed') {
       console.log('Connection failed, attempting restart...');
       // Implement reconnection logic
     }
   };
   ```

3. **Signaling Issues**

   ```typescript
   // Ensure Supabase connection is working
   import { supabase } from '../lib/supabase';

   const testConnection = async () => {
     const { data, error } = await supabase.from('sessions').select('count');
     if (error) {
       console.error('Supabase connection failed:', error);
     }
   };
   ```

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Partial support (some WebRTC features may be limited)
- **Mobile**: Supported on modern browsers

### Performance Optimization

1. **Video Quality Adjustment**

   ```typescript
   // Lower quality for poor connections
   const constraints = {
     video: {
       width: { ideal: 640 },
       height: { ideal: 480 },
       frameRate: { ideal: 15 },
     },
   };
   ```

2. **Connection Monitoring**
   ```typescript
   // Monitor connection quality
   const monitorConnection = (peerConnection: RTCPeerConnection) => {
     setInterval(async () => {
       const stats = await peerConnection.getStats();
       // Analyze stats and adjust quality
     }, 5000);
   };
   ```

## Security Considerations

1. **Session Validation**: Always validate session ownership before allowing
   video calls
2. **RLS Policies**: Implement proper Row Level Security in Supabase
3. **Rate Limiting**: Prevent abuse of signaling endpoints
4. **User Authentication**: Ensure users are properly authenticated

## Testing

### Unit Tests

Run the comprehensive test suite:

```bash
npm test src/hooks/useWebRTC.test.ts
npm test src/components/sessions/VideoCall.test.tsx
```

### Manual Testing

1. **Basic Flow**: Start call, toggle controls, end call
2. **Multi-user**: Test with two browser windows
3. **Error Handling**: Test with blocked permissions
4. **Network Issues**: Test with poor connectivity

## Future Enhancements

1. **Recording**: Add session recording capabilities
2. **Chat**: Integrate text chat during video calls
3. **File Sharing**: Allow document sharing during sessions
4. **Analytics**: Track call quality and duration metrics
5. **Mobile App**: Extend to React Native implementation

## Support

For technical support or questions about the video call implementation:

1. Check the troubleshooting section above
2. Review the test files for usage examples
3. Consult the Supabase Realtime documentation
4. Check browser console for WebRTC-specific errors

---

_Last updated: January 2025_
