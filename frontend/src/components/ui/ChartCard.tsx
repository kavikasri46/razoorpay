import React from 'react';
import Card from './Card';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children, action }) => {
  return (
    <Card className="flex flex-col h-full bg-slate-900/60 border-slate-850">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-800/30">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[250px] relative">
        {children}
      </div>
    </Card>
  );
};
export default ChartCard;
