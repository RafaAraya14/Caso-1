import React, { useEffect, useState } from 'react';

import { ChatWindow } from '../chat';
import { SubscriptionPlans } from '../subscription';
import UserProfile from '../ui/UserProfile';
import { VideoCall } from '../video';

import { default as CoachProfile } from './CoachProfile';
import ModernCoachSearch from './ModernCoachSearch';

import type { Coach } from '../../types/coach';

interface CoachAppProps {
  onLogout?: () => void;
  user: { email: string };
}

type ViewState = 'search' | 'profile' | 'chat' | 'video-call' | 'subscriptions';

const CoachApp: React.FC<CoachAppProps> = ({ onLogout, user }) => {
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium'>('free');
  const [sessionsUsed, setSessionsUsed] = useState<number>(0);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Load saved plan and sessions on component mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('20mincoach-current-plan');
    if (savedPlan === 'premium' || savedPlan === 'free') {
      setCurrentPlan(savedPlan);
    }

    const savedSessions = localStorage.getItem('20mincoach-sessions-used');
    if (savedSessions) {
      setSessionsUsed(parseInt(savedSessions, 10) || 0);
    }
  }, []);

  // Save plan to localStorage when it changes
  const handlePlanChange = (newPlan: 'free' | 'premium') => {
    setCurrentPlan(newPlan);
    localStorage.setItem('20mincoach-current-plan', newPlan);
  };

  const handleCoachSelect = (coach: Coach) => {
    setSelectedCoach(coach);
    setCurrentView('profile');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedCoach(null);
  };

  const handleConnectNow = (coach: Coach) => {
    // Check if free plan user has sessions available
    if (currentPlan === 'free' && sessionsUsed >= 10) {
      // Show notification instead of alert
      console.warn(
        'Has agotado tus sesiones mensuales. Actualiza a Premium para sesiones ilimitadas.'
      );
      setCurrentView('subscriptions');
      return;
    }

    setSelectedCoach(coach);
    setCurrentView('video-call');
    console.log('Iniciando videollamada con:', coach.displayname);
  };

  const handleSendMessage = (coach: Coach) => {
    setSelectedCoach(coach);
    setCurrentView('chat');
    // Aquí implementaremos el chat más adelante
    console.log('Abriendo chat con:', coach.displayname);
  };

  const handleShowSubscriptions = () => {
    setCurrentView('subscriptions');
  };

  // Session tracking functions
  const handleSessionComplete = () => {
    if (currentPlan === 'free') {
      const newSessionCount = sessionsUsed + 1;
      setSessionsUsed(newSessionCount);
      localStorage.setItem('20mincoach-sessions-used', newSessionCount.toString());
    }
  };

  // Profile modal handlers
  const handleShowProfile = () => {
    setShowUserProfile(true);
  };

  const handleCloseProfile = () => {
    setShowUserProfile(false);
  };

  const handleLogout = () => {
    setShowUserProfile(false);
    onLogout?.();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'search':
        return (
          <ModernCoachSearch
            onCoachSelect={handleCoachSelect}
            onShowSubscriptions={handleShowSubscriptions}
            onLogout={onLogout}
            user={user}
          />
        );
      case 'profile':
        if (!selectedCoach) {
          setCurrentView('search');
          return null;
        }
        return (
          <CoachProfile
            coach={selectedCoach}
            onBackToSearch={handleBackToSearch}
            onConnectNow={handleConnectNow}
            onSendMessage={handleSendMessage}
            onLogout={onLogout}
          />
        );
      case 'chat':
        if (!selectedCoach) {
          setCurrentView('search');
          return null;
        }
        return (
          <ChatWindow coach={selectedCoach} onClose={handleBackToSearch} onLogout={onLogout} />
        );
      case 'video-call':
        if (!selectedCoach) {
          setCurrentView('search');
          return null;
        }
        return (
          <VideoCall
            coach={selectedCoach}
            onEndCall={handleBackToSearch}
            onSessionComplete={handleSessionComplete}
            onLogout={onLogout}
          />
        );
      case 'subscriptions':
        return (
          <SubscriptionPlans
            onBackToSearch={handleBackToSearch}
            onLogout={onLogout}
            currentPlan={currentPlan}
            onPlanChange={handlePlanChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderCurrentView()}

      {/* Floating Profile Button */}
      <button
        onClick={handleShowProfile}
        className="fixed top-4 right-4 z-30 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      >
        <i className="fas fa-user text-lg" />
      </button>

      {/* User Profile Modal */}
      {user && (
        <UserProfile
          user={user}
          currentPlan={currentPlan}
          sessionsUsed={sessionsUsed}
          isOpen={showUserProfile}
          onClose={handleCloseProfile}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default CoachApp;
