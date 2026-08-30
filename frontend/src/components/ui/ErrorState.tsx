import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message = 'Failed to load data. Please check your connection.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-red-950/5 border border-red-900/10 rounded-xl">
      <AlertTriangle className="h-10 w-10 text-red-400 mb-4" />
      <h3 className="text-base font-semibold text-white mb-1.5">Load Error</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
export default ErrorState;
