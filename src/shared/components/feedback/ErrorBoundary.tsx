'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className='flex min-h-50 items-center justify-center rounded-xl border border-red-100 bg-red-50 p-8 text-center'>
            <div>
              <p className='text-lg font-semibold text-red-700'>
                Something went wrong
              </p>
              <button
                className='mt-3 text-sm text-red-600 underline hover:text-red-800'
                onClick={() => this.setState({ hasError: false })}
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
