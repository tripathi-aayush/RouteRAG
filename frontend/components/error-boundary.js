import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center bg-red-50 rounded-lg">
          <div className="text-center p-4">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-sm text-red-600">Please try refreshing the page</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}