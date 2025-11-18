import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Store error details in state for display
    this.state = {
      hasError: true,
      error: error,
      errorInfo: errorInfo
    };

    // If this is a React error #130, provide specific debugging info
    if (error.message && error.message.includes('Objects are not valid as a React child')) {
      console.error('React Error #130 Details:');
      console.error('This error occurs when trying to render an object directly in JSX');
      console.error('Check for:', {
        'Database objects': 'Make sure all data from database is properly serialized',
        'JSON objects': 'Ensure JSON.parse results are converted to strings/primitives',
        'Component props': 'Verify all props are primitive values or valid React elements',
        'Array items': 'Check that map() returns valid JSX, not objects'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for production
      if (process.env.NODE_ENV === 'production') {
        return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-400 mb-4">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Development error details
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-red-400 mb-4">React Error Boundary</h2>
              <div className="bg-black/50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Error:</h3>
                <pre className="text-red-300 text-sm overflow-x-auto">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </div>
              <div className="bg-black/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Component Stack:</h3>
                <pre className="text-gray-300 text-xs overflow-x-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mr-2"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;