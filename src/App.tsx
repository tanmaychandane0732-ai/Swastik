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
import { CursorRipple } from './components/common/CursorRipple';
import { TrainingDeckPage } from './pages/TrainingDeckPage';
import { ScamDetectiveGame } from './components/scam/ScamDetectiveGame';
import { FinancialTurbulenceGame } from './components/turbulence/FinancialTurbulenceGame';
import { SmoothScrollProvider } from './components/providers/SmoothScrollProvider';
import { ScrollChapterIndicator } from './components/common/ScrollChapterIndicator';
import { FinQuestStartupLoader } from './components/common/FinQuestStartupLoader';
import { DynamicEnvironment } from './components/environment/DynamicEnvironment';
import { ScrollImageSequenceCanvas } from './components/common/ScrollImageSequenceCanvas';


const GameShell: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isStartupLoading, setIsStartupLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('finquest_startup_seen');
    }
    return true;
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isVideoConfigOpen, setIsVideoConfigOpen] = useState(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);
  const [activeLandingChapter, setActiveLandingChapter] = useState('hero');
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.muted = true;
      if (!isStartupLoading) {
        bgVideoRef.current.play().catch(() => {});
      } else {
        bgVideoRef.current.pause();
      }
    }
  }, [isStartupLoading]);

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
            onActiveChapterChange={setActiveLandingChapter}
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

  const isLight = state.settings.theme === 'light';

  return (
    <SmoothScrollProvider>
      <div className={`min-h-screen ${isLight ? 'text-[#17191D] theme-clean' : 'text-[#F5F3EF]'} flex flex-col font-sans selection:bg-[#FF6A2A]/30 selection:text-[#FF6A2A] relative transition-colors duration-500`}>
        {/* Cinematic Scroll-Linked Image Sequence Canvas (Landing & Hero) */}
        {state.gameStage === 'landing' ? (
          <ScrollImageSequenceCanvas isLight={isLight} />
        ) : (
          <>
            {/* Background Video at Lowest Visual Layer for gameplay stages */}
            <video
              ref={bgVideoRef}
              autoPlay
              muted
              loop
              playsInline
              src="/hero.mp4"
              className={`fixed inset-0 w-full h-full object-cover pointer-events-none z-0 transition-opacity duration-500 ${isLight ? 'opacity-20' : 'opacity-40'}`}
            />
            {/* Atmospheric Overlay for gameplay stages */}
            <div className={`fixed inset-0 pointer-events-none z-0 transition-colors duration-500 ${isLight ? 'bg-gradient-to-b from-[#F4F1EC]/88 via-[#F4F1EC]/78 to-[#F4F1EC]/92' : 'bg-gradient-to-b from-[#0A0C0F]/78 via-[#0A0C0F]/62 to-[#0A0C0F]/88'}`} />
          </>
        )}

        {/* Dynamic Multi-Layer Scrolling Environment */}
        <DynamicEnvironment activeChapter={activeLandingChapter} />

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

        {/* Chapter indicator — only on landing page scroll story */}
        <ScrollChapterIndicator
          visible={state.gameStage === 'landing'}
          onActiveChapterChange={setActiveLandingChapter}
        />

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

        {/* Interactive Cursor-Aware Companion & Ripple Engine */}
        <CursorBuddy />
        <CursorRipple />

        {/* Cinematic Startup Flight Calibration Loader */}
        {isStartupLoading && (
          <FinQuestStartupLoader onComplete={() => setIsStartupLoading(false)} />
        )}
      </div>
    </SmoothScrollProvider>
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
