import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

/**
 * ErrorBoundary — catches JavaScript errors in child components.
 *
 * Without this, a single crashing component takes down the entire app.
 * With it, only the broken section shows an error UI while the rest works.
 *
 * Why class component? React hooks don't support componentDidCatch yet.
 * This is the recommended React pattern for error boundaries.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * Interview note: Error boundaries demonstrate understanding of React's
 * error handling model, production resilience, and graceful degradation.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // In production, send to error tracking service (Sentry, DataDog, etc.)
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. This has been reported to our team.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="w-full mt-2 text-left">
                <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                  Error details (development only)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 mt-2">
              <Button onClick={this.handleReset} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                size="sm"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
