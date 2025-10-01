import React, { useEffect, useRef, useState } from 'react';

interface TwoFactorAuthProps {
  onVerifySuccess: () => void;
  onBackToLogin: () => void;
  userEmail?: string;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onVerifySuccess,
  onBackToLogin,
  userEmail,
}) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value.length <= 6) {
      setCode(value);
      setMessage('');
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (code.length !== 6) {
      setMessage('Por favor ingresa un código de 6 dígitos');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      // Simulate 2FA verification API call
      // In a real implementation, this would verify the code with your backend
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, accept any 6-digit code
      // In production, you'd verify against the actual 2FA service
      if (code === '000000') {
        setMessage('Código incorrecto. Inténtalo de nuevo.');
        return;
      }

      // Success
      onVerifySuccess();
    } catch (err) {
      setMessage('Error al verificar el código. Inténtalo de nuevo.');
      console.error('2FA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify(e as any);
    }
  };

  const resendCode = async () => {
    setMessage('');
    setIsLoading(true);

    // Simulate resend API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMessage('Código reenviado a tu correo electrónico');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-4">
            Verificación Requerida
          </h2>

          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            Ingresa el código de 6 dígitos enviado a{' '}
            {userEmail ? (
              <span className="font-medium text-slate-800 dark:text-slate-200">{userEmail}</span>
            ) : (
              'tu correo'
            )}
            .
          </p>

          {message && (
            <div
              className={`mb-6 p-3 rounded-lg ${
                message.includes('Error') || message.includes('incorrecto')
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                  : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label htmlFor="2fa-code" className="sr-only">
                Código de Verificación
              </label>
              <input
                ref={inputRef}
                type="text"
                id="2fa-code"
                value={code}
                onChange={handleCodeChange}
                onKeyPress={handleKeyPress}
                inputMode="numeric"
                pattern="[0-9]*"
                className="shadow-sm appearance-none border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-600 rounded-lg w-full py-3 px-4 text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700/50 leading-tight focus:outline-none focus:ring-0 text-center text-3xl tracking-[.5em]"
                placeholder="------"
                maxLength={6}
                disabled={isLoading}
                autoComplete="one-time-code"
              />
            </div>

            <div className="flex items-center justify-center mb-4">
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verificando...
                  </div>
                ) : (
                  'Verificar Código'
                )}
              </button>
            </div>
          </form>

          <div className="flex flex-col space-y-3 text-center">
            <button
              type="button"
              onClick={resendCode}
              disabled={isLoading}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Reenviar código
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              disabled={isLoading}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              ← Volver al login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
