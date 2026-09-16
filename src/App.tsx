import React, { useState } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TopHUD } from './components/hud/TopHUD';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import { BadgeModal } from './components/badges/BadgeModal';
import { CertificateModal } from './components/certificate/CertificateModal';
import { LandingPage } from './pages/LandingPage';
import { OnboardingModal } from './pages/OnboardingModal';
import { DashboardPage } from './pages/DashboardPage';
import { Level1Budgeting } from './pages/games/Level1Budgeting';
import { Level2DebtTrap } from './pages/games/Level2DebtTrap';
import { Level3ScamRadar } from './pages/games/Level3ScamRadar';
import { ResultsPage } from './pages/ResultsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';

const GameShell: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const renderCurrentStage = () => {
    switch (state.gameStage) {
      case 'landing':
        return (
          <LandingPage
            onStartQuest={() => {
              if (state.player.name) {
                dispatch({ type: 'SET_STAGE', payload: 'dashboard' });
              } else {
                setIsOnboardingOpen(true);
              }
            }}
          />
        );

      case 'dashboard':
        return <DashboardPage />;

      case 'level1':
        return <Level1Budgeting />;

      case 'level2':
        return <Level2DebtTrap />;

      case 'level3':
        return <Level3ScamRadar />;

      case 'results':
        return (
          <ResultsPage
            onOpenCertificate={() => setIsCertificateOpen(true)}
          />
        );

      case 'leaderboard':
        return <LeaderboardPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-fin-bg text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Persistent Financial HUD */}
      <TopHUD
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenLeaderboard={() => dispatch({ type: 'SET_STAGE', payload: 'leaderboard' })}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />

      {/* Main Gameplay Canvas */}
      <main className="flex-1">
        {renderCurrentStage()}
      </main>

      {/* Global Modals */}
      <FeedbackModal />
      <BadgeModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameShell />
      </GameProvider>
    </ErrorBoundary>
  );
}
