import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled crash:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-md relative overflow-hidden bg-grid-pattern">
          {/* Decorative ambient orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-error-container opacity-20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary-container opacity-20 blur-[100px] pointer-events-none" />

          <div className="max-w-xl w-full z-10 animate-slide-in-bottom">
            {/* Main Error Card */}
            <div className="glassmorphism rounded-2xl p-xl shadow-2xl relative border border-outline-variant">
              <div className="absolute -top-6 left-lg bg-error text-on-error p-sm rounded-xl shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>

              <div className="mt-md">
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mb-sm">
                  System Encountered a Glitch
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-lg">
                  MyKlasi encountered an unexpected runtime exception. We've logged this internally to be fixed immediately.
                  You can try reloading the application or returning home.
                </p>

                {/* Technical details toggle */}
                {this.state.error && (
                  <details className="mb-lg bg-surface-container border border-outline-variant rounded-xl overflow-hidden group">
                    <summary className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant cursor-pointer hover:bg-surface-container-low hover:text-on-surface transition-colors select-none flex justify-between items-center">
                      <span>Show Technical Details</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 transform group-open:rotate-180 transition-transform"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </summary>
                    <div className="p-md border-t border-outline-variant bg-surface-container-lowest font-mono font-body-sm text-body-sm text-error max-h-48 overflow-y-auto leading-normal">
                      <p className="font-bold mb-xs">{this.state.error.toString()}</p>
                      {this.state.errorInfo && (
                        <pre className="whitespace-pre-wrap text-[10px] text-on-surface-variant mt-sm">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-sm">
                  <button
                    onClick={this.handleReload}
                    className="flex-1 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-[10px] px-lg rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    Reload Portal
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 bg-surface border border-outline-variant hover:bg-surface-container text-on-surface font-label-md text-label-md py-[10px] px-lg rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-sm"
                  >
                    Go back Home
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-lg leading-relaxed">
              MyKlasi School Management System &bull; "Every class. Every day. Every child."
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
