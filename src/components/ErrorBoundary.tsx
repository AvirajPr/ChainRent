import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
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
    console.error('Uncaught Error in Component Tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-bright dark:bg-surface-dim text-on-surface dark:text-on-surface flex flex-col justify-center items-center p-6">
          <div className="max-w-md w-full bg-surface-container-lowest dark:bg-surface-container-dark p-8 rounded-2xl border border-outline-variant/30 shadow-2xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline tracking-tight text-on-surface dark:text-on-surface">
                Application Exception
              </h2>
              <p className="text-sm text-on-surface-variant dark:text-on-surface-variant font-body">
                An unexpected error occurred while processing ledger telemetry or rendering UI views.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-surface-container/50 dark:bg-surface-container-high-dark p-3 rounded-lg text-left text-xs font-mono text-error overflow-x-auto border border-error/20 max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-outline/30 text-on-surface font-label hover:bg-surface-container/80 transition-all text-sm font-medium"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label hover:opacity-90 transition-all text-sm font-medium shadow-md shadow-primary/20"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
