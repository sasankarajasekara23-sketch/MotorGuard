import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600">Please refresh the page and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
