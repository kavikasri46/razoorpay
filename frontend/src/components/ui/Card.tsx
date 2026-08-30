import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverEffect = false, className = '', ...props }) => {
  return (
    <div
      className={`bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl transition-all ${
        hoverEffect ? 'hover:border-slate-700/80 hover:shadow-cyan-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
