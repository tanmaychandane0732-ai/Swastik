import React, { useState, useRef, useEffect } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TopHUD } from './components/hud/TopHUD';
import { LiveVideoBackground } from './components/common/LiveVideoBackground';
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
import { LifeSimulatorGame } from './pages/games/LifeSimulatorGame';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { AcademyPage } from './pages/AcademyPage';
import { ClassroomCockpit } from './components/flight/ClassroomCockpit';
import { JudgeDemoModeModal } from './components/flight/JudgeDemoModeModal';
import { DailyFlightChallengeModal } from './components/flight/DailyFlightChallengeModal';
import { CursorBuddy } from './components/common/CursorBuddy';
import { TrainingDeckPage } from './pages/TrainingDeckPage';
import { ScamDetectiveGame } from './components/scam/ScamDetectiveGame';
import { FinancialTurbulenceGame } from './components/turbulence/FinancialTurbulenceGame';

const GameShell: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isVideoConfigOpen, setIsVideoConfigOpen] = useState(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.muted = true;
      bgVideoRef.current.play().catch(() => {});
    }
  }, []);

  const renderCurrentStage = () => {
    switch (state.gameStage) {
      case 'landing':
        return (
          <LandingPage
            onStartQuest={(playerName?: string) => {
              if (playerName && playerName.trim()) {
                dispatch({ type: 'SET_PLAYER_NAME', payload: playerName.trim() });
                dispatch({ type: 'SET_STAGE', payload: 'dashboard' });
              } else {
                setIsOnboardingOpen(true);
              }
            }}
            onOpenCertificate={() => setIsCertificateOpen(true)}
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

      case 'simulator':
        return (
          <LifeSimulatorGame
            onOpenCertificate={() => setIsCertificateOpen(true)}
          />
        );

      case 'diagnostic':
        return <DiagnosticPage />;

      case 'academy':
        return <AcademyPage />;

      case 'classroom':
        return (
          <ClassroomCockpit
            onBackToHub={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
          />
        );

      case 'training-deck':
        return <TrainingDeckPage />;

      case 'scam-detective':
        return (
          <ScamDetectiveGame
            onBackToHub={() => dispatch({ type: 'SET_STAGE', payload: 'training-deck' })}
          />
        );

      case 'turbulence':
        return (
          <FinancialTurbulenceGame
            onBackToHub={() => dispatch({ type: 'SET_STAGE', payload: 'training-deck' })}
          />
        );

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col font-sans selection:bg-[#FF5E1E]/30 selection:text-[#FF5E1E] relative">
      {/* Background Video at Lowest Visual Layer */}
      <video
        ref={bgVideoRef}
        autoPlay
        muted
        loop
        playsInline
        src="/hero.mp4"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
      />

      {/* Live Ambient Video Background Component */}
      <LiveVideoBackground
        isConfigOpen={isVideoConfigOpen}
        onCloseConfig={() => setIsVideoConfigOpen(false)}
      />

      {/* Persistent Financial HUD */}
      <TopHUD
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenLeaderboard={() => dispatch({ type: 'SET_STAGE', payload: 'leaderboard' })}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onOpenVideoSettings={() => setIsVideoConfigOpen(true)}
        onOpenJudgeDemo={() => setIsJudgeDemoOpen(true)}
        onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
      />

      {/* Main Gameplay Canvas */}
      <main className="flex-1 relative z-10">
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

      {/* Judge Demo Walkthrough Modal (2 Min) */}
      <JudgeDemoModeModal
        isOpen={isJudgeDemoOpen}
        onClose={() => setIsJudgeDemoOpen(false)}
        onNavigateToStage={(stage) => dispatch({ type: 'SET_STAGE', payload: stage as any })}
      />

      {/* Daily Flight Dilemma Modal */}
      <DailyFlightChallengeModal
        isOpen={isDailyChallengeOpen}
        onClose={() => setIsDailyChallengeOpen(false)}
        onIncrementStreak={() => dispatch({ type: 'INCREMENT_STREAK' })}
      />

      {/* Interactive Cursor-Aware Companion */}
      <CursorBuddy />
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
