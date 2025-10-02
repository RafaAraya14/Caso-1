import React, { useEffect, useRef, useState } from 'react';

const CameraTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStream, setHasStream] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasStream(true);
        }
      } catch (err) {
        setError(`Error: ${(err as Error).message}`);
      }
    };

    startCamera();
  }, []);

  return (
    <div
      style={{ padding: '20px', backgroundColor: '#1e293b', color: 'white', minHeight: '100vh' }}
    >
      <h1>Prueba de Cámara</h1>
      <div style={{ marginTop: '20px' }}>
        {hasStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '400px',
              height: '300px',
              backgroundColor: 'black',
              border: '2px solid #666',
            }}
          />
        ) : (
          <div
            style={{
              width: '400px',
              height: '300px',
              backgroundColor: 'black',
              border: '2px solid #666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {error ? error : 'Cargando cámara...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraTest;
