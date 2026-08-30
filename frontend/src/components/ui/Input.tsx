import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  light?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, light = false, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
            light ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all ${
            light 
              ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-violet-500 focus:border-violet-500'
              : 'bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:ring-cyan-500 focus:border-cyan-500'
          } ${
            error ? 'border-red-500/80 focus:ring-red-500 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-400 mt-1 block font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
