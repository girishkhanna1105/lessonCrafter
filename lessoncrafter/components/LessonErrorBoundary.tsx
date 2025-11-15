// components/LessonErrorBoundary.tsx
"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  onRuntimeError: (error: Error) => void;
  // REMOVED: fallback: React.ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class LessonErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error("LessonRunner Runtime Error:", error, errorInfo);
    
    // Call the callback prop to notify the parent page
    this.props.onRuntimeError(error);
  }

  render() {
    if (this.state.hasError) {
      // NEW: Render the fallback UI directly inside the boundary
      // This avoids the React.cloneElement error
      return (
        <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-md text-red-300">
          <h3 className="font-bold text-lg mb-2">⚠️ Lesson Runtime Error</h3>
          <p className="text-sm font-mono">
            {this.state.error?.message || "An unknown error occurred."}
          </p>
        </div>
      );
    }

    // If no error, render children (the <LivePreview />)
    return this.props.children;
  }
}

export default LessonErrorBoundary;