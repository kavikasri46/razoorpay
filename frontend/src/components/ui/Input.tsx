import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-slate-950 border text-slate-200 placeholder:text-slate-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all ${
            error ? 'border-red-500/80 focus:ring-red-500 focus:border-red-500' : 'border-slate-800 focus:ring-cyan-500'
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
