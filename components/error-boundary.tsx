"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 *
 * Cattura errori JavaScript in qualsiasi componente figlio,
 * registra gli errori e mostra un'interfaccia di fallback
 * invece di far crashare l'intera applicazione.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Aggiorna lo stato in modo che il prossimo render mostri il fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Puoi anche loggare l'errore su un servizio di error reporting
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puoi renderizzare qualsiasi UI di fallback personalizzata
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="mb-4 flex justify-center">
                <svg
                  className="h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
                Oops! Qualcosa è andato storto
              </h1>

              <p className="mb-6 text-center text-gray-600">
                Si è verificato un errore imprevisto.
                Puoi provare a ricaricare la pagina o tornare alla dashboard.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-red-800">
                    Errore (visibile solo in sviluppo):
                  </h3>
                  <pre className="overflow-x-auto text-xs text-red-700">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.location.reload();
                  }}
                  className="flex-1 rounded-md bg-wine-600 px-4 py-2 text-sm font-semibold text-white hover:bg-wine-500"
                >
                  Ricarica pagina
                </button>

                <Link
                  href="/dashboard"
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Vai alla Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
