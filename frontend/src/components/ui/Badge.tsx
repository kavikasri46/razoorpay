import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '', ...props }) => {
  const styles = {
    success: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30',
    warning: 'bg-amber-950/40 text-amber-400 border border-amber-900/30',
    danger: 'bg-red-950/40 text-red-400 border border-red-900/30',
    info: 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/30',
    neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide uppercase ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
export default Badge;
