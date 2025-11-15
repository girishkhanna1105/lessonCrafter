// components/LessonRunner.tsx
"use client";

import React from "react";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import LessonErrorBoundary from "./LessonErrorBoundary"; // Import stays the same

interface LessonRunnerProps {
  code: string;
  onRuntimeError: (error: Error) => void;
}

// REMOVED: The RuntimeFallback component is no longer needed here.
// const RuntimeFallback = ({ error }: { error?: Error }) => ( ... );

export default function LessonRunner({ code, onRuntimeError }: LessonRunnerProps) {
  
  // This safety check is still good
  if (code.includes("require(")) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-red-300">
        <h3 className="text-xl font-bold mb-2">⚠️ Invalid Code Detected</h3>
        <p className="text-sm mb-4">
          This lesson contains <code>require()</code> statements which are not supported.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <LiveProvider
        code={code}
        scope={{
          React,
          useState: React.useState,
          useEffect: React.useEffect,
          useRef: React.useRef,
          useMemo: React.useMemo,
          useCallback: React.useCallback,
          useContext: React.useContext,
          useReducer: React.useReducer,
        }}
        noInline={true}
      >
        {/* This shows COMPILE errors */}
        <LiveError className="text-red-400 bg-red-950/30 rounded-md p-3 text-sm whitespace-pre-wrap font-mono mb-4" />
        
        {/* This catches RUNTIME errors */}
        <LessonErrorBoundary 
          onRuntimeError={onRuntimeError}
          // REMOVED: The fallback prop is gone
        >
          <LivePreview />
        </LessonErrorBoundary>
      </LiveProvider>
    </div>
  );
}