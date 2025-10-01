import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ThemeToggle } from '../ui/ThemeToggle';

import ModernLogin from './ModernLogin';
import TwoFactorAuth from './TwoFactorAuth';

interface AuthFlowProps {
  onAuthSuccess?: () => void;
}

type AuthStep = 'login' | '2fa' | 'success';

const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess }) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [userEmail, setUserEmail] = useState<string>('');
  const navigate = useNavigate();

  const handle2FASuccess = () => {
    setCurrentStep('success');
    navigate('/dashboard');
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setUserEmail('');
  };

  const renderAuthStep = () => {
    switch (currentStep) {
      case 'login':
        return (
          <ModernLogin
            onShow2FA={() => setCurrentStep('2fa')}
            onLoginSuccess={() => handle2FASuccess()}
          />
        );
      case '2fa':
        return (
          <TwoFactorAuth
            onVerifySuccess={handle2FASuccess}
            onBackToLogin={handleBackToLogin}
            userEmail={userEmail}
          />
        );
      case 'success':
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-4 text-slate-600 dark:text-slate-400">Redirigiendo...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-slate-900 font-sans gradient-bg">
      <div className="fixed top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      {renderAuthStep()}
    </div>
  );
};

export default AuthFlow;
