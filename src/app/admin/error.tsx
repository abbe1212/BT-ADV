'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0A1F33] rounded-2xl border border-red-500/20 p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-red-500/50"></div>
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-white/60 mb-8 leading-relaxed">
          {error.message || 'An unexpected error occurred while loading the dashboard. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="w-full py-3 bg-[#061520] text-white border border-[#14304A] rounded-xl hover:bg-[#14304A] hover:text-white transition-all flex items-center justify-center gap-2 font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
