import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-900/30">
      <table className={`w-full border-collapse text-left text-sm text-slate-300 ${className}`} {...props}>
        <thead className="bg-slate-900 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold text-slate-400">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 bg-slate-900/10">
          {children}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
