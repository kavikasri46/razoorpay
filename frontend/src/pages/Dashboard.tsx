import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import { 
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Cpu,
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

interface ReviewQueueItem {
  id: string;
  issue: string;
  amount: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const Dashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTx, setSelectedTx] = useState<ExceptionItem | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([
    { id: 'TX034', issue: 'Missing Invoice', amount: '₹12,000', priority: 'HIGH' },
    { id: 'TX052', issue: 'Amount Mismatch', amount: '₹8,500', priority: 'MEDIUM' },
    { id: 'TX071', issue: 'Duplicate Record', amount: '₹4,000', priority: 'HIGH' }
  ]);

  // Reconciliation statistics
  const totalRecords = 100;
  const matchedCount = 87;
  const exceptionCount = 13;
  const unresolvedCount = 5;
  const matchRate = 87;
  const totalValue = '₹12.45 L';

  // Trends for Match Rate
  const trendData = [
    { name: 'Run 1', rate: 78 },
    { name: 'Run 2', rate: 82 },
    { name: 'Run 3', rate: 85 },
    { name: 'Run 4', rate: 87 }
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
    }, 1500);
  };

  const handleExportReport = () => {
    toast.success('Reconciliation PDF report compiled and downloaded!');
  };

  const handleMarkReviewed = (id: string) => {
    setReviewQueue(reviewQueue.filter(item => item.id !== id));
    toast.success(`Transaction ${id} marked as reviewed and settled.`);
  };

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold block">AI Finance Controller</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-outfit mt-1">
            AI-Powered Financial Reconciliation
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            Last Run: 30 Aug 2026, 03:42 PM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/data-center" className="flex items-center gap-1.5 px-4.5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm">
            <Upload className="h-4 w-4 text-slate-400" /> Upload Data
          </Link>
          <Button 
            onClick={handleRunReconciliation}
            loading={isRunning}
            className="bg-teal-600 hover:bg-teal-750 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 py-2.5"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} /> Run Reconciliation
          </Button>
          <Button 
            onClick={handleExportReport}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 py-2.5 border-0"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { title: 'Total Records', value: totalRecords, desc: 'Processed entries' },
          { title: 'Matched', value: matchedCount, desc: '87.0% success rate' },
          { title: 'Exceptions', value: exceptionCount, desc: '13.0% audit failures' },
          { title: 'Match Rate', value: `${matchRate}.0%`, desc: 'Target rate: 95.0%' },
          { title: 'Unresolved', value: unresolvedCount, desc: 'Review required', danger: true },
          { title: 'Total Value', value: totalValue, desc: 'Net balance audited' }
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-white border-slate-100 p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">{kpi.title}</span>
            <div className="my-3">
              <h3 className={`text-2xl font-black font-outfit ${kpi.danger ? 'text-rose-600' : 'text-slate-800'}`}>{kpi.value}</h3>
            </div>
            <span className="text-[10px] text-slate-450 font-semibold block">{kpi.desc}</span>
          </Card>
        ))}
      </div>

      {/* 2-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Reconciliation Status Bars */}
        <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">Reconciliation Status</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Distribution count across 100 total audited records</p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Matched', count: 87, pct: 87, color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Mismatched', count: 8, pct: 8, color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'Missing', count: 3, pct: 3, color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Duplicate', count: 1, pct: 1, color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Unresolved', count: 1, pct: 1, color: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50' }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1 text-left">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${stat.color} inline-block`} />
                    {stat.label}
                  </span>
                  <span className="text-slate-500">{stat.count} records ({stat.pct}%)</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100/50">
                  <div className={`h-full ${stat.color}`} style={{ width: `${stat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Side: Multi-Source Summaries */}
        <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">Multi-Source Summary</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Integrations links and feeds processed during reconciliation</p>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Bank Transactions Feed', records: '100 Records', val: '₹12,45,000', status: 'Processed ✅' },
              { name: 'Invoice Ledger Source', records: '98 Records', val: '₹12,20,000', status: 'Processed ✅' },
              { name: 'Payment Gateway Link', records: '100 Records', val: '₹12,40,000', status: 'Processed ✅' }
            ].map((src, idx) => (
              <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center">
                <div className="space-y-1.5 text-left">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    {src.name}
                  </h5>
                  <div className="flex gap-4 text-[10px] text-slate-400 font-semibold">
                    <span>{src.records}</span>
                    <span>•</span>
                    <span className="text-slate-500 font-bold">{src.val}</span>
                  </div>
                </div>
                <Badge variant="success" className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] py-1 px-2.5">
                  Processed
                </Badge>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Match Rate (Accuracy Comparison) & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Reconciliation Accuracy */}
        <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm grid grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center justify-center border-r border-slate-100 py-4">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-teal-500" strokeWidth="3" strokeDasharray="87, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="text-center">
                <span className="text-2xl font-black text-slate-800 block font-outfit">87%</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block mt-0.5">Match Rate</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-3 text-center">87 / 100 records reconciled<br/>Target: 95.0%</p>
          </div>

          <div className="space-y-4 text-left">
            <h5 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Historical Accuracy</h5>
            <div className="flex gap-8 items-center py-2">
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">Previous Run</span>
                <span className="text-xl font-black text-slate-700 font-outfit mt-0.5">82%</span>
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <div>
                <span className="text-slate-400 text-[10px] font-bold block">Current Run</span>
                <span className="text-xl font-black text-teal-650 font-outfit mt-0.5">87%</span>
              </div>
            </div>
            <Badge variant="success" className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] py-0.5 px-1.5 uppercase font-bold">
              +5% improvement
            </Badge>
          </div>
        </Card>

        {/* Right Side: Financial Summary */}
        <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">Financial Summary</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Value mapping of reconciled cash volumes</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Total Transaction Value', val: '₹12,45,000', color: 'text-slate-800' },
              { title: 'Successfully Reconciled', val: '₹10,85,000', color: 'text-emerald-600' },
              { title: 'Exception Value', val: '₹1,60,000', color: 'text-rose-600' },
              { title: 'Unresolved Value', val: '₹42,500', color: 'text-amber-600' }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4.5 rounded-2xl text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">{item.title}</span>
                <span className={`text-lg font-black font-outfit block mt-1.5 ${item.color}`}>{item.val}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Exception Summary & Processing Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Exception Summary Table */}
        <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">Exception Summary</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Detailed categorisation of audit exception logs</p>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                  <th className="py-2.5 px-4">Exception Type</th>
                  <th className="py-2.5 px-4 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {[
                  { type: 'Amount Mismatch', count: 5 },
                  { type: 'Date Mismatch', count: 1 },
                  { type: 'Missing Record', count: 3 },
                  { type: 'Duplicate', count: 1 },
                  { type: 'Unresolved exceptions', count: 3 }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30">
                    <td className="py-2.5 px-4">{row.type}</td>
                    <td className="py-2.5 px-4 text-right text-slate-900 font-bold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Side: Processing Performance */}
        <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">Processing Performance</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Platform throughput and engine matching speed metrics</p>
          </div>

          <div className="divide-y divide-slate-50">
            {[
              { label: 'Records Processed', value: '100', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Processing Time', value: '4.8 seconds', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'Records / Second', value: '20.8 items/sec', icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Successful Matches', value: '87 perfect maps', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' }
            ].map((perf, idx) => (
              <div key={idx} className="py-3.5 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                <div className="flex gap-3 items-center">
                  <div className={`h-8 w-8 rounded-lg ${perf.bg} ${perf.color} flex items-center justify-center shrink-0 border border-slate-100/50`}>
                    <perf.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{perf.label}</span>
                </div>
                <span className="text-xs font-black text-slate-800 font-outfit">{perf.value}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Recent Exceptions (Difference Viewer) */}
      <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">Recent Exceptions</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Click any entry to view individual difference audit details</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Bank Record</th>
                <th className="py-3 px-4">Invoice Record</th>
                <th className="py-3 px-4">Difference</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
              {exceptions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{tx.id}</td>
                  <td className="py-3 px-4">{tx.customer}</td>
                  <td className="py-3 px-4">{tx.bankAmount}</td>
                  <td className="py-3 px-4">{tx.invoiceAmount}</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">{tx.difference}</td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => {
                        setSelectedTx(tx);
                        toast.info(`Opening reconciliation auditor panel for ${tx.id}`);
                      }}
                      className="px-3 py-1 bg-violet-50 hover:bg-violet-100 text-violet-650 font-bold rounded-lg transition-colors text-[10px] border border-violet-100"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-extrabold"
            >
              ✕
            </button>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-outfit border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-violet-500 animate-pulse" />
              Transaction Audit Panel: {selectedTx.id}
            </h3>

            <div className="space-y-4 py-4 text-xs font-semibold text-slate-650">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">Customer Name:</span>
                <span className="text-slate-800 font-bold">{selectedTx.customer}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">Bank Entry amount:</span>
                <span className="text-slate-800 font-bold">{selectedTx.bankAmount}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">Invoice Entry amount:</span>
                <span className="text-slate-800 font-bold">{selectedTx.invoiceAmount}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">Isolated Difference:</span>
                <span className="text-rose-600 font-bold">{selectedTx.difference}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">AI Confident Score:</span>
                <span className="text-teal-600 font-bold">{selectedTx.confidence}%</span>
              </div>

              <div className="bg-amber-50 border border-amber-100 text-amber-700 p-3 rounded-2xl text-[10px] font-bold flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4 text-amber-550 shrink-0" />
                <span>Status: ⚠️ Human Review Required (Flagged discrepancy exception)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => {
                  setSelectedTx(null);
                  toast.success(`Transaction ${selectedTx.id} has been marked as matched manually.`);
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-750 text-white rounded-xl text-xs font-bold py-2.5"
              >
                Mark Reconciled
              </Button>
              <Button 
                onClick={() => setSelectedTx(null)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold py-2.5 border border-slate-100"
              >
                Close Panel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Matching Confidence & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: AI Matching Confidence */}
        <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">AI Matching Confidence</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Confidence distribution metrics calculated by Llama-3.1-8b</p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'High Confidence', count: 82, pct: 82, color: 'bg-emerald-500' },
              { label: 'Medium Confidence', count: 10, pct: 10, color: 'bg-indigo-500' },
              { label: 'Low Confidence', count: 8, pct: 8, color: 'bg-rose-500' }
            ].map((conf, idx) => (
              <div key={idx} className="space-y-1.5 text-left">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-slate-700">{conf.label}</span>
                  <span className="text-slate-500">{conf.count} records ({conf.pct}%)</span>
                </div>
                <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100/50">
                  <div className={`h-full ${conf.color}`} style={{ width: `${conf.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Side: AI Insights (Forensic summaries) */}
        <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 text-left">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Brain className="h-4.5 w-4.5 text-violet-500" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-outfit">🤖 AI Reconciliation Insights</h4>
          </div>

          <ul className="space-y-3 text-xs font-semibold text-slate-650">
            {[
              '87% of multi-source records were successfully reconciled.',
              'Most exceptions are caused by amount discrepancies (e.g. discount adjustments).',
              '3 invoices are currently missing from the local accounting ledger source.',
              '₹42,500 unresolved exception value requires human review queue actions.',
              'No automatic match was made for 1 low-confidence duplicate reference.'
            ].map((insightStr, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className="text-violet-500 font-bold">•</span>
                <span className="leading-relaxed">{insightStr}</span>
              </li>
            ))}
          </ul>
        </Card>

      </div>

      {/* Human Review Queue */}
      <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">Human Review Required Queue</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">{reviewQueue.length} exceptions require manual verification</p>
        </div>

        {reviewQueue.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-bold text-xs">
            🎉 All exceptions reviewed and settled!
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                  <th className="py-2.5 px-4">Transaction ID</th>
                  <th className="py-2.5 px-4">Isolated Issue</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {reviewQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.id}</td>
                    <td className="py-3 px-4">{item.issue}</td>
                    <td className="py-3 px-4 text-slate-800">{item.amount}</td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        item.priority === 'HIGH' ? 'danger' : 'warning'
                      } className="text-[9px] font-bold">
                        {item.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => {
                          const exc = exceptions.find(e => e.id === item.id) || {
                            id: item.id,
                            customer: 'Acme Corp',
                            bankAmount: item.amount,
                            invoiceAmount: '-',
                            difference: '-',
                            status: 'UNRESOLVED',
                            confidence: 50
                          };
                          setSelectedTx(exc);
                        }}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-650 font-bold rounded-lg transition-colors border border-slate-100"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleMarkReviewed(item.id)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 font-bold rounded-lg transition-colors border border-emerald-100"
                      >
                        Settle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Match Rate Trend */}
      <Card className="bg-white border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest font-outfit">Match Rate Accuracy Trend</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">System reconciliation rate improvements over consecutive runs</p>
        </div>

        <div className="h-[200px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="rate" name="Match Rate Accuracy" stroke="#00a896" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4, fill: '#00a896', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
};

export default Dashboard;
