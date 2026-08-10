import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React ErrorBoundary caught an unhandled error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#070B12] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-3xl">
              <FiAlertTriangle />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-400">
                An unexpected error occurred in the application.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left bg-black/50 p-4 rounded-xl border border-white/5 text-xs font-mono text-red-300 max-h-40 overflow-y-auto space-y-1">
                <div className="font-bold">{this.state.error.toString()}</div>
                {this.state.errorInfo && (
                  <pre className="text-[10px] text-gray-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-yellow-glow"
            >
              <FiRefreshCw className="text-base" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
