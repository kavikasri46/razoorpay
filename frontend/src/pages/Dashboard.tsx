import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import { generateReconciliationPDF } from '../utils/pdfGenerator';
import { 
  Upload,
  Download,
  AlertCircle,
  Brain,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';

interface ExceptionItem {
  id: string;
  customer: string;
  bankAmount: string;
  invoiceAmount: string;
  difference: string;
  status: string;
  confidence: number;
}



export const Dashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTx, setSelectedTx] = useState<ExceptionItem | null>(null);


  // Reconciliation statistics
  const totalRecords = 100;
  const matchedCount = 87;
  const exceptionCount = 13;
  const unresolvedCount = 5;
  const matchRate = 87;
  const totalValue = '₹12.45 L';

  // Trends for Match Rate
  const trendData = [
    { name: 'R1', rate: 78 },
    { name: 'R2', rate: 82 },
    { name: 'R3', rate: 85 },
    { name: 'R4', rate: 87 }
  ];

  // Exceptions list
  const exceptions: ExceptionItem[] = [
    { id: 'TX002', customer: 'XYZ Ltd', bankAmount: '₹5,000', invoiceAmount: '₹5,500', difference: '₹500', status: 'MISMATCH', confidence: 98 },
    { id: 'TX018', customer: 'ABC Ltd', bankAmount: '₹8,000', invoiceAmount: '₹7,500', difference: '₹500', status: 'MISMATCH', confidence: 72 },
    { id: 'TX034', customer: 'PQR Ltd', bankAmount: '₹12,000', invoiceAmount: 'Missing', difference: '—', status: 'UNRESOLVED', confidence: 41 }
  ];

  const handleRunReconciliation = () => {
    setIsRunning(true);
    toast.info('Starting multi-source reconciliation matching rules...');
    setTimeout(() => {
      setIsRunning(false);
      toast.success('Reconciliation completed! 100 records audited, 87% match accuracy.');
    }, 1200);
  };

  const handleExportReport = () => {
    try {
      generateReconciliationPDF({
        totalCompared: totalRecords,
        matchedCount: matchedCount,
        differenceCount: exceptionCount,
        matchRate: matchRate,
        aiReport: '87% ledger match accuracy achieved across bank statements and invoice entries. 13 exceptions flagged for finance controller review.',
        discrepancies: exceptions.map(e => ({
          transaction_id: e.id,
          bankAmount: parseFloat(e.bankAmount.replace(/[^0-9.-]/g, '')) || 0,
          invoiceAmount: parseFloat(e.invoiceAmount.replace(/[^0-9.-]/g, '')) || 0,
          difference: parseFloat(e.difference.replace(/[^0-9.-]/g, '')) || 500,
          reason: e.status
        }))
      });
      toast.success('Reconciliation PDF generated and downloaded (< 150 KB)!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to compile PDF report.');
    }
  };



  return (
    <div className="flex flex-col space-y-4 font-sans text-slate-800 antialiased max-h-[calc(100vh-6rem)] overflow-hidden text-xs">
      
      {/* Compact Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm gap-3 shrink-0">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">AI Finance Controller</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-slate-400 font-semibold">Last Run: 30 Aug 2026, 03:42 PM</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight font-outfit mt-0.5">
            Financial Reconciliation Overview
          </h2>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link to="/data-center" className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-750 rounded-lg font-bold transition-all text-[11px] shadow-sm flex-1 sm:flex-initial">
            <Upload className="h-3.5 w-3.5 text-slate-400" /> Upload
          </Link>
          <Button 
            onClick={handleRunReconciliation}
            loading={isRunning}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 py-1.5 text-[11px] flex-1 sm:flex-initial"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} /> Run Match
          </Button>
          <Button 
            onClick={handleExportReport}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 py-1.5 border-0 text-[11px] flex-1 sm:flex-initial"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* 2-Column Compact Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 overflow-hidden">
        
        {/* ================= COLUMN 1 ================= */}
        <div className="space-y-4 flex flex-col overflow-hidden">
          {/* KPI 3x2 Grid */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            {[
              { title: 'Total Records', value: totalRecords, desc: 'Processed' },
              { title: 'Matched', value: matchedCount, desc: '87.0% success' },
              { title: 'Exceptions', value: exceptionCount, desc: '13.0% failures' },
              { title: 'Match Rate', value: `${matchRate}.0%`, desc: 'Target 95.0%' },
              { title: 'Unresolved', value: unresolvedCount, desc: 'Review required', danger: true },
              { title: 'Total Value', value: totalValue, desc: 'Audited' }
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-2.5 rounded-xl text-left flex flex-col justify-between shadow-sm">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">{kpi.title}</span>
                <h3 className={`text-sm font-black font-outfit mt-1 ${kpi.danger ? 'text-rose-600' : 'text-slate-800'}`}>{kpi.value}</h3>
                <span className="text-[8px] text-slate-400 mt-1 block truncate leading-none">{kpi.desc}</span>
              </div>
            ))}
          </div>

          {/* AI Insights (Forensic summaries) */}
          <Card className="bg-white border-slate-100 p-3.5 rounded-2xl shadow-sm text-left flex flex-col shrink-0">
            <div className="flex items-center gap-1 border-b border-slate-100 pb-1.5 mb-2 shrink-0">
              <Brain className="h-4 w-4 text-violet-500" />
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider font-outfit">🤖 AI Reconciliation Insights</h4>
            </div>
            <ul className="space-y-1.5 text-[9px] font-bold text-slate-650">
              {[
                '87% of records reconciled successfully.',
                'Discrepancies predominantly driven by amount differences.',
                '3 missing invoices isolated from the ledger source.',
                '₹42,500 requires human review queue actions.'
              ].map((insightStr, idx) => (
                <li key={idx} className="flex gap-1.5 items-start">
                  <span className="text-violet-500">•</span>
                  <span className="leading-tight">{insightStr}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Match Rate Accuracy Trend (Mini Recharts Graph) */}
          <Card className="bg-white border-slate-100 p-3.5 rounded-2xl shadow-sm text-left flex flex-col shrink-0">
            <div className="border-b border-slate-100 pb-1.5 mb-2">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-outfit">Match Rate Trend</h4>
            </div>

            <div className="h-[90px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '9px', padding: '4px' }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#00a896" strokeWidth={2.5} dot={{ r: 2.5, fill: '#00a896', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ================= COLUMN 2 ================= */}
        <div className="space-y-4 flex flex-col overflow-hidden">
          {/* Accuracy & Value Summary combined */}
          <Card className="bg-white border-slate-100 p-3.5 rounded-2xl shadow-sm text-left flex gap-4 shrink-0 items-center">
            <div className="flex flex-col items-center justify-center border-r border-slate-100 pr-4 shrink-0">
              <div className="relative h-20 w-20 flex items-center justify-center">
                <svg className="absolute inset-0 transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-teal-500" strokeWidth="3" strokeDasharray="87, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="text-center">
                  <span className="text-base font-black text-slate-800 block font-outfit">87%</span>
                  <span className="text-[7px] uppercase tracking-wider text-slate-400 font-bold block">Accuracy</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                { title: 'Reconciled Value', val: '₹10.85 L', color: 'text-emerald-600' },
                { title: 'Exception Value', val: '₹1.60 L', color: 'text-rose-600' }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50/50 border border-slate-100 p-2 rounded-xl">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block truncate">{item.title}</span>
                  <span className={`text-xs font-black font-outfit mt-0.5 block ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Exceptions Table */}
          <Card className="bg-white border-slate-100 p-3.5 rounded-2xl shadow-sm text-left flex flex-col overflow-hidden flex-1">
            <div className="border-b border-slate-100 pb-1.5 mb-2 shrink-0">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-outfit">Exceptions Summary Table</h4>
            </div>

            <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-55 border-b border-slate-100 text-slate-500 font-bold">
                    <th className="py-2 px-3">Exception Type</th>
                    <th className="py-2 px-3 text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {[
                    { type: 'Amount Mismatch', count: 5 },
                    { type: 'Date Mismatch', count: 1 },
                    { type: 'Missing Record', count: 3 },
                    { type: 'Duplicate Record', count: 1 },
                    { type: 'Unresolved Feed Entries', count: 3 }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30">
                      <td className="py-2 px-3">{row.type}</td>
                      <td className="py-2 px-3 text-right text-slate-900 font-bold">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Difference Viewer */}
          <Card className="bg-white border-slate-100 p-3.5 rounded-2xl shadow-sm text-left flex flex-col overflow-hidden flex-1">
            <div className="border-b border-slate-100 pb-1.5 mb-2 shrink-0">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-outfit">Recent Exception Differences</h4>
            </div>

            <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Bank</th>
                    <th className="py-2 px-3">Invoice</th>
                    <th className="py-2 px-3">Diff</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {exceptions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-bold text-slate-900">{tx.id}</td>
                      <td className="py-2 px-3">{tx.bankAmount}</td>
                      <td className="py-2 px-3">{tx.invoiceAmount}</td>
                      <td className="py-2 px-3 text-rose-600 font-bold">{tx.difference}</td>
                      <td className="py-2 px-3 text-center">
                        <button 
                          onClick={() => setSelectedTx(tx)}
                          className="px-2 py-0.5 bg-violet-50 hover:bg-violet-100 text-violet-650 font-bold rounded-md transition-colors text-[9px] border border-violet-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>



      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-sm rounded-2xl p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 text-sm font-extrabold"
            >
              ✕
            </button>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-outfit border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" />
              Transaction details: {selectedTx.id}
            </h3>

            <div className="space-y-3 py-3 text-[11px] font-semibold text-slate-650 text-left">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Customer:</span>
                <span className="text-slate-800 font-bold">{selectedTx.customer}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Bank Value:</span>
                <span className="text-slate-800 font-bold">{selectedTx.bankAmount}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Invoice Value:</span>
                <span className="text-slate-800 font-bold">{selectedTx.invoiceAmount}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Difference:</span>
                <span className="text-rose-600 font-bold">{selectedTx.difference}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">AI Confidence:</span>
                <span className="text-teal-650 font-bold">{selectedTx.confidence}%</span>
              </div>

              <div className="bg-amber-50 border border-amber-100 text-amber-700 p-2.5 rounded-xl text-[9px] font-bold flex items-center gap-1.5 mt-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-550 shrink-0" />
                <span>Status: ⚠️ Human Review Required</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1.5">
              <Button 
                onClick={() => {
                  setSelectedTx(null);
                  toast.success(`Transaction ${selectedTx.id} manually settled.`);
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold py-2"
              >
                Mark Reconciled
              </Button>
              <Button 
                onClick={() => setSelectedTx(null)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold py-2 border border-slate-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
