import React from 'react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon, trend }) => {
  return (
    <Card hoverEffect className="flex flex-col justify-between h-full bg-slate-900/60 border-slate-850">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
          {icon && <span className="text-slate-500 bg-slate-950 p-2 rounded-lg border border-slate-800/80">{icon}</span>}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">{value}</h2>
      </div>
      {(subtext || trend) && (
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-800/30">
          {trend && (
            <span className={`text-xs font-bold ${
              trend.type === 'positive' ? 'text-emerald-400' :
              trend.type === 'negative' ? 'text-red-400' : 'text-slate-400'
            }`}>
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-[11px] text-slate-500">{subtext}</span>}
        </div>
      )}
    </Card>
  );
};
export default StatCard;
