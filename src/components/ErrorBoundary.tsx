"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: Error;
  } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Vous pouvez loguer l'erreur à un service de suivi des erreurs ici
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, on l'utilise
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, on affiche notre UI d'erreur par défaut
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg max-w-md w-full text-center border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-center mb-4">
              <span>⚠️</span>
            </div>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
              Une erreur est survenue
            </h2>
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded mb-4 text-left overflow-auto max-h-60 text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium">Message:</p>
              <p className="mb-2">
                {this.state.error?.message || "Erreur inconnue"}
              </p>

              {this.state.errorInfo && (
                <>
                  <p className="font-medium mt-2">Stack:</p>
                  <pre className="whitespace-pre-wrap text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={this.resetError}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>RefreshCcw</span>
                Réessayer
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Retour à l{"'"}accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
