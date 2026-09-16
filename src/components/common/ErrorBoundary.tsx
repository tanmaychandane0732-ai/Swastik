import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught FinQuest React Error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('finquest_game_state_v1');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Simulation Paused
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              FinQuest encountered an unexpected rendering hiccup. Your game engine can safely recover.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-neon-indigo cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Clean Quest</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
