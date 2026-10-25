"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Backward-compatible redirect from legacy /page2 route to canonical /studio route.
 */
export default function LegacyPage2Redirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/studio");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
      <Loader2 className="w-8 h-8 text-cobalt-600 animate-spin mb-4" />
      <p className="text-sm font-mono text-slate-500">Redirecting to Creation Studio...</p>
    </div>
  );
}