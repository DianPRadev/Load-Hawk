import { Component, type ReactNode } from "react";
import { GoldButton } from "./GoldButton";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-center bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-12 max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={28} className="text-destructive" />
            </div>
            <h1 className="font-display text-2xl mb-3">Something went wrong</h1>
            <p className="text-muted-foreground text-[14px] mb-6">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <GoldButton onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}>
              Back to Home
            </GoldButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
