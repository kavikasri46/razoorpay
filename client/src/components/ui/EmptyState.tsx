import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl">
      <AlertCircle className="h-10 w-10 text-slate-600 mb-4" />
      <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && action}
    </div>
  );
};
export default EmptyState;
