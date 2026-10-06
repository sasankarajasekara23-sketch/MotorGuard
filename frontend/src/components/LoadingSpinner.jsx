import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="space-y-6 animate-in" role="status" aria-label="Loading">
    <div className="space-y-2">
      <div className="skeleton h-8 w-56" />
      <div className="skeleton h-4 w-80 max-w-full" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="skeleton h-28" />
      <div className="skeleton h-28" />
      <div className="skeleton h-28" />
    </div>
    <div className="skeleton h-56" />
    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Loading...
    </div>
  </div>
);

export default LoadingSpinner;
