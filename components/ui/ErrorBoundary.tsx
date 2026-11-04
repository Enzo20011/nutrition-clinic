'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  section?: string;
}

/**
 * ErrorBoundary — Catches React render errors from child subtrees.
 * Use this to wrap admin sections so a crash in one panel
 * doesn't take down the entire page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.section || 'App'}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <div>
            <h3 className="text-lg font-black text-fg uppercase tracking-tight">
              {this.props.section || 'Sección'} no disponible
            </h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">
              Ocurrió un error inesperado. Recargá la página o contactá soporte.
            </p>
            {this.state.error && (
              <p className="text-danger/60 text-xs mt-3 font-mono">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2 rounded-xl bg-accent-soft border border-accent/30 text-accent text-sm font-bold hover:bg-accent/30 transition-all"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
