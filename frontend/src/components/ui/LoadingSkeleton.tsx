import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'chart' | 'stats';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', count = 1 }) => {
  const renderItem = () => {
    switch (type) {
      case 'stats':
        return (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl animate-pulse flex flex-col gap-3">
            <div className="h-4 w-24 bg-slate-800 rounded"></div>
            <div className="h-8 w-32 bg-slate-800 rounded"></div>
            <div className="h-3 w-40 bg-slate-800 rounded"></div>
          </div>
        );
      case 'table':
        return (
          <div className="border border-slate-800 rounded-xl overflow-hidden animate-pulse">
            <div className="h-12 bg-slate-900 border-b border-slate-800"></div>
            <div className="divide-y divide-slate-800 bg-slate-900/40">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-14 flex items-center px-6 gap-4">
                  <div className="h-4 w-12 bg-slate-800 rounded"></div>
                  <div className="h-4 w-full bg-slate-800 rounded"></div>
                  <div className="h-4 w-24 bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'chart':
        return (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl animate-pulse h-80 flex flex-col justify-between">
            <div className="h-4 w-36 bg-slate-800 rounded"></div>
            <div className="flex-1 flex items-end gap-3 mt-6">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-800 rounded-t flex-1" 
                  style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }}
                ></div>
              ))}
            </div>
          </div>
        );
      default: // card
        return (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl animate-pulse flex flex-col gap-4">
            <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
            <div className="h-4 w-2/3 bg-slate-800 rounded"></div>
            <div className="h-10 w-full bg-slate-800 rounded mt-2"></div>
          </div>
        );
    }
  };

  return (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderItem()}</React.Fragment>
      ))}
    </div>
  );
};
export default LoadingSkeleton;
