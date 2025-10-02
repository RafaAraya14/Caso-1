import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import VideoCall from './VideoCall';

// Mock the useWebRTC hook
const mockUseWebRTC = {
  localStream: null as MediaStream | null,
  remoteStream: null as MediaStream | null,
  isConnected: false,
  isConnecting: false,
  error: null as string | null,
  isCameraOn: true,
  isMicrophoneOn: true,
  remoteUserId: null as string | null,
  startCall: jest.fn(),
  endCall: jest.fn(),
  toggleCamera: jest.fn(),
  toggleMicrophone: jest.fn(),
};

jest.mock('../../hooks/useWebRTCWithSignaling', () => ({
  __esModule: true,
  default: () => mockUseWebRTC,
}));

// Mock HTML Video element
Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
  set: jest.fn(),
  get: jest.fn(),
});

describe('VideoCall Component', () => {
  const defaultProps = {
    sessionId: 'test-session-123',
    userId: 'test-user-456',
    onCallEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state
    mockUseWebRTC.localStream = null;
    mockUseWebRTC.remoteStream = null;
    mockUseWebRTC.isConnected = false;
    mockUseWebRTC.isConnecting = false;
    mockUseWebRTC.error = null;
    mockUseWebRTC.isCameraOn = true;
    mockUseWebRTC.isMicrophoneOn = true;
    mockUseWebRTC.remoteUserId = null;
  });

  it('should render session info correctly', () => {
    render(<VideoCall {...defaultProps} />);

    expect(screen.getByText('Sesión de Coaching')).toBeInTheDocument();
    expect(screen.getByText('ID: test-session-123')).toBeInTheDocument();
  });

  it('should show connecting status when isConnecting is true', () => {
    mockUseWebRTC.isConnecting = true;

    render(<VideoCall {...defaultProps} />);

    expect(screen.getAllByText('Conectando...')[0]).toBeInTheDocument();
  });

  it('should show connected status when isConnected is true', () => {
    mockUseWebRTC.isConnected = true;

    render(<VideoCall {...defaultProps} />);

    expect(screen.getByText('Conectado')).toBeInTheDocument();
    expect(screen.getByText('Llamada activa')).toBeInTheDocument();
  });

  it('should display error message when error exists', () => {
    mockUseWebRTC.error = 'Connection failed';

    render(<VideoCall {...defaultProps} />);

    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('should show waiting message when no remote stream', () => {
    render(<VideoCall {...defaultProps} />);

    expect(screen.getByText('Esperando al coach...')).toBeInTheDocument();
  });

  it('should call startCall on mount with correct parameters', async () => {
    render(<VideoCall {...defaultProps} />);

    await waitFor(() => {
      expect(mockUseWebRTC.startCall).toHaveBeenCalledWith('test-session-123', 'test-user-456');
    });
  });

  it('should toggle microphone when microphone button is clicked', () => {
    render(<VideoCall {...defaultProps} />);

    const micButton = screen.getByTestId('microphone-toggle');
    fireEvent.click(micButton);

    expect(mockUseWebRTC.toggleMicrophone).toHaveBeenCalled();
  });

  it('should toggle camera when camera button is clicked', () => {
    render(<VideoCall {...defaultProps} />);

    const cameraButton = screen.getByTestId('camera-toggle');
    fireEvent.click(cameraButton);

    expect(mockUseWebRTC.toggleCamera).toHaveBeenCalled();
  });

  it('should end call when end call button is clicked', () => {
    const mockOnCallEnd = jest.fn();
    render(<VideoCall {...defaultProps} onCallEnd={mockOnCallEnd} />);

    const endCallButton = screen.getByTestId('end-call-button');
    fireEvent.click(endCallButton);

    expect(mockUseWebRTC.endCall).toHaveBeenCalled();
    expect(mockOnCallEnd).toHaveBeenCalled();
  });

  it('should apply correct styles when camera is off', () => {
    mockUseWebRTC.isCameraOn = false;

    render(<VideoCall {...defaultProps} />);

    const cameraButton = screen.getByTestId('camera-toggle');
    // Verificar que el botón contenedor tiene las clases apropiadas
    expect(cameraButton.parentElement).toHaveClass('bg-red-600');
  });

  it('should apply correct styles when microphone is off', () => {
    mockUseWebRTC.isMicrophoneOn = false;

    render(<VideoCall {...defaultProps} />);

    const micButton = screen.getByTestId('microphone-toggle');
    // Verificar que el botón contenedor tiene las clases apropiadas
    expect(micButton.parentElement).toHaveClass('bg-red-600');
  });

  it('should show correct status text based on connection state', () => {
    // Test disconnected state
    render(<VideoCall {...defaultProps} />);
    expect(screen.getByText('Desconectado')).toBeInTheDocument();

    // Re-render with connecting state
    mockUseWebRTC.isConnecting = true;
    render(<VideoCall {...defaultProps} />);
    expect(screen.getAllByText('Conectando...')[0]).toBeInTheDocument();

    // Re-render with connected state
    mockUseWebRTC.isConnecting = false;
    mockUseWebRTC.isConnected = true;
    render(<VideoCall {...defaultProps} />);
    expect(screen.getByText('Llamada activa')).toBeInTheDocument();
  });

  it('should handle custom className prop', () => {
    const { container } = render(<VideoCall {...defaultProps} className="custom-class" />);

    const videoCallElement = container.firstChild as HTMLElement;
    expect(videoCallElement).toHaveClass('custom-class');
  });

  it('should handle onCallEnd prop correctly', () => {
    const mockOnCallEnd = jest.fn();
    render(<VideoCall {...defaultProps} onCallEnd={mockOnCallEnd} />);

    const endCallButton = screen.getByTestId('end-call-button');
    fireEvent.click(endCallButton);

    expect(mockOnCallEnd).toHaveBeenCalledTimes(1);
  });

  it('should work without onCallEnd prop', () => {
    const { onCallEnd, ...propsWithoutOnCallEnd } = defaultProps;

    expect(() => {
      render(<VideoCall {...propsWithoutOnCallEnd} />);
    }).not.toThrow();

    const endCallButton = screen.getByTestId('end-call-button');
    expect(() => {
      fireEvent.click(endCallButton);
    }).not.toThrow();
  });
});
