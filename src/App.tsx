import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { TopHUD } from './components/hud/TopHUD';
import { LiveVideoBackground } from './components/common/LiveVideoBackground';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import { LandingPage } from './pages/LandingPage';
import { OnboardingModal } from './pages/OnboardingModal';
import { CursorBuddy } from './components/common/CursorBuddy';
import { CursorRipple } from './components/common/CursorRipple';
import { SmoothScrollProvider } from './components/providers/SmoothScrollProvider';
import { ScrollChapterIndicator } from './components/common/ScrollChapterIndicator';
import { FinQuestStartupLoader } from './components/common/FinQuestStartupLoader';
import { DynamicEnvironment } from './components/environment/DynamicEnvironment';
import { ScrollImageSequenceCanvas } from './components/common/ScrollImageSequenceCanvas';
import { BackToTop } from './components/common/BackToTop';
import { CoPilotChatbot } from './components/chat/CoPilotChatbot';
import { localAuth } from './services/localAuth';

// Lazy-loaded game stages (instant initial landing page, on-demand stage calibration)
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const Level1Budgeting = lazy(() => import('./pages/games/Level1Budgeting').then(m => ({ default: m.Level1Budgeting })));
const Level2DebtTrap = lazy(() => import('./pages/games/Level2DebtTrap').then(m => ({ default: m.Level2DebtTrap })));
const Level3ScamRadar = lazy(() => import('./pages/games/Level3ScamRadar').then(m => ({ default: m.Level3ScamRadar })));
const ResultsPage = lazy(() => import('./pages/ResultsPage').then(m => ({ default: m.ResultsPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const LifeSimulatorGame = lazy(() => import('./pages/games/LifeSimulatorGame').then(m => ({ default: m.LifeSimulatorGame })));
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage').then(m => ({ default: m.DiagnosticPage })));
const AcademyPage = lazy(() => import('./pages/AcademyPage').then(m => ({ default: m.AcademyPage })));
const ClassroomCockpit = lazy(() => import('./components/flight/ClassroomCockpit').then(m => ({ default: m.ClassroomCockpit })));
const TrainingDeckPage = lazy(() => import('./pages/TrainingDeckPage').then(m => ({ default: m.TrainingDeckPage })));
const ScamDetectiveGame = lazy(() => import('./components/scam/ScamDetectiveGame').then(m => ({ default: m.ScamDetectiveGame })));
const FinancialTurbulenceGame = lazy(() => import('./components/turbulence/FinancialTurbulenceGame').then(m => ({ default: m.FinancialTurbulenceGame })));

// Lazy-loaded secondary modals
const BadgeModal = lazy(() => import('./components/badges/BadgeModal').then(m => ({ default: m.BadgeModal })));
const CertificateModal = lazy(() => import('./components/certificate/CertificateModal').then(m => ({ default: m.CertificateModal })));
const JudgeDemoModeModal = lazy(() => import('./components/flight/JudgeDemoModeModal').then(m => ({ default: m.JudgeDemoModeModal })));
const DailyFlightChallengeModal = lazy(() => import('./components/flight/DailyFlightChallengeModal').then(m => ({ default: m.DailyFlightChallengeModal })));

const StageLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh] select-none">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 rounded-full border-2 border-[#FF6A2A] border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-zinc-400 tracking-widest uppercase">Calibrating Flight Deck...</span>
    </div>
  </div>
);

const GameShell: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isStartupLoading, setIsStartupLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('finquest_startup_seen');
    }
    return true;
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingInitialTab, setOnboardingInitialTab] = useState<'register' | 'login' | 'guest'>('register');
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

  // Auto pop-up auth/identification window after loading screen finishes if user is not identified
  useEffect(() => {
    if (!isStartupLoading) {
      const isIdentified = localAuth.isIdentified() || (!!state.player.name && state.player.name.trim() !== '' && state.player.name !== 'Cadet');
      if (!isIdentified) {
        setOnboardingInitialTab('register');
        setIsOnboardingOpen(true);
      }
    }
  }, [isStartupLoading, state.player.name]);

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
                setOnboardingInitialTab('guest');
                setIsOnboardingOpen(true);
              }
            }}
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onActiveChapterChange={setActiveLandingChapter}
            onOpenAuth={(tab) => {
              setOnboardingInitialTab(tab || 'register');
              setIsOnboardingOpen(true);
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
          onOpenAuth={(tab) => {
            setOnboardingInitialTab(tab || 'register');
            setIsOnboardingOpen(true);
          }}
        />

        {/* Main Gameplay Canvas with Suspense Boundary for Lazy Stages */}
        <main className="flex-1 relative z-10" id="main-content">
          <Suspense fallback={<StageLoadingFallback />}>
            {renderCurrentStage()}
          </Suspense>
        </main>

        {/* Chapter indicator — only on landing page scroll story */}
        <ScrollChapterIndicator
          visible={state.gameStage === 'landing'}
          onActiveChapterChange={setActiveLandingChapter}
        />

        {/* Global Modals */}
        <FeedbackModal />

        <Suspense fallback={null}>
          {isBadgesOpen && (
            <BadgeModal
              isOpen={isBadgesOpen}
              onClose={() => setIsBadgesOpen(false)}
            />
          )}

          {isCertificateOpen && (
            <CertificateModal
              isOpen={isCertificateOpen}
              onClose={() => setIsCertificateOpen(false)}
            />
          )}

          {/* Judge Demo Walkthrough Modal (2 Min) */}
          {isJudgeDemoOpen && (
            <JudgeDemoModeModal
              isOpen={isJudgeDemoOpen}
              onClose={() => setIsJudgeDemoOpen(false)}
              onNavigateToStage={(stage) => dispatch({ type: 'SET_STAGE', payload: stage as any })}
            />
          )}

          {/* Daily Flight Dilemma Modal */}
          {isDailyChallengeOpen && (
            <DailyFlightChallengeModal
              isOpen={isDailyChallengeOpen}
              onClose={() => setIsDailyChallengeOpen(false)}
              onIncrementStreak={() => dispatch({ type: 'INCREMENT_STREAK' })}
            />
          )}
        </Suspense>

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          initialTab={onboardingInitialTab}
        />

        {/* Interactive Companion, Click Radar Ripples, BackToTop, and AI Co-Pilot Chatbot */}
        <CursorBuddy />
        <CursorRipple />
        <BackToTop />
        <CoPilotChatbot />

        {/* Cinematic Startup Flight Calibration Loader */}
        {isStartupLoading && (
          <FinQuestStartupLoader
            onComplete={() => {
              setIsStartupLoading(false);
              const isIdentified = localAuth.isIdentified() || (!!state.player.name && state.player.name.trim() !== '' && state.player.name !== 'Cadet');
              if (!isIdentified) {
                setOnboardingInitialTab('register');
                setIsOnboardingOpen(true);
              }
            }}
          />
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
