import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-red-200">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-red-900 mb-2">Something went wrong</h1>
            <p className="text-red-700 mb-6 text-lg leading-relaxed">
              We're sorry, but something unexpected happened in the application. 
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors mb-6"
            >
              Refresh Page
            </button>
            <p className="text-sm text-red-600 mb-4">
              💡 <strong>Tip:</strong> Check your browser's Developer Console (F12) for more details.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left border-t border-red-200 pt-4">
                <summary className="cursor-pointer text-sm font-bold text-red-700 mb-3 hover:text-red-900">
                  ▼ Error Details (Development Only)
                </summary>
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <p className="font-mono text-xs text-red-900 whitespace-pre-wrap break-words max-h-96 overflow-auto">
                    {this.state.error.toString()}
                  </p>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

