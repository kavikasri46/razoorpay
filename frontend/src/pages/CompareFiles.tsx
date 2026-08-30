import React, { useState, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import { api } from '../services/api';
import {
  ArrowLeftRight,
  RefreshCw,
  Search,
  Sparkles,
  FileSpreadsheet,
  Check,
  UploadCloud,
  Landmark,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ScanLine,
  GitCompare,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';

/* ─── CSV Parser ───────────────────────────────────────────────── */
function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    const row: any = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? null; });
    return row;
  });
}

function splitCSVLine(line: string) {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  result.push(cur.trim());
  return result.map((v) => v.replace(/^"|"$/g, ''));
}

/* ─── Types ─────────────────────────────────────────────────────── */
interface Discrepancy {
  id: string;
  bankAmount: number | string;
  invoiceAmount: number | string;
  difference: number | string;
  status: 'mismatch' | 'missing_invoice' | 'missing_bank';
  description: string;
}

/* ─── Helpers ───────────────────────────────────────────────────── */
const fmtINR = (val: number | string) =>
  val !== '-' ? `₹${Number(val).toLocaleString('en-IN')}` : '—';

const statusBadge = (status: Discrepancy['status']) => {
  if (status === 'mismatch')
    return (
      <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
        <XCircle className="h-3 w-3" /> Amount Mismatch
      </span>
    );
  if (status === 'missing_invoice')
    return (
      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
        <AlertTriangle className="h-3 w-3" /> Missing in Invoice
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-100 text-sky-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
      <AlertTriangle className="h-3 w-3" /> Missing in Bank
    </span>
  );
};

/* ─── Upload Drop-Zone Card ─────────────────────────────────────── */
interface DropZoneProps {
  label: string;
  desc: string;
  icon: React.ReactNode;
  accentClass: string;
  file: File | null;
  recordCount: number;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}
const DropZone: React.FC<DropZoneProps> = ({
  label, desc, icon, accentClass, file, recordCount, inputRef, onChange, onClear,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      const synth = { target: { files: [dropped] } } as any;
      onChange(synth);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`bg-white border-2 rounded-2xl p-7 flex flex-col items-center justify-center text-center space-y-4 transition-all duration-200 cursor-default
        ${dragging ? 'border-teal-500 bg-teal-50/30 scale-[1.01]' : file ? 'border-emerald-300 bg-emerald-50/20' : 'border-dashed border-slate-200 hover:border-teal-300 hover:bg-slate-50/40'}`}
    >
      {/* Icon ring */}
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm ${accentClass}`}>
        {icon}
      </div>

      <div>
        <h4 className="text-sm font-black text-slate-800 font-outfit">{label}</h4>
        <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">{desc}</p>
      </div>

      {file ? (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <span className="text-[11px] text-emerald-700 font-bold truncate max-w-[160px]">{file.name}</span>
            <button onClick={onClear} className="ml-2 text-slate-400 hover:text-rose-500 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-emerald-600 flex items-center justify-center gap-1 font-bold">
            <CheckCircle2 className="h-3 w-3" /> {recordCount} records loaded
          </span>
        </div>
      ) : (
        <div className="w-full space-y-2.5">
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            Upload File
          </button>
          <p className="text-[10px] text-slate-400 font-semibold">Drag & drop or click — CSV / JSON</p>
        </div>
      )}

      <input type="file" ref={inputRef} onChange={onChange} className="hidden" accept=".csv,.json" />
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
export const CompareFiles: React.FC = () => {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [bankData, setBankData] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [totalCompared, setTotalCompared] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [differenceCount, setDifferenceCount] = useState(0);
  const [matchRate, setMatchRate] = useState(0);
  const [discrepancyList, setDiscrepancyList] = useState<Discrepancy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiReport, setAiReport] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const bankInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  /* File handlers */
  const readFile = (file: File, onDone: (rows: any[]) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = file.name.endsWith('.json') ? JSON.parse(text) : parseCSV(text);
        onDone(parsed);
      } catch {
        toast.error('Failed to parse file.');
      }
    };
    reader.readAsText(file);
  };

  const handleBankFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file, (rows) => {
      setBankFile(file);
      setBankData(rows);
      toast.success(`Bank statement loaded — ${rows.length} records`);
    });
  };

  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file, (rows) => {
      setInvoiceFile(file);
      setInvoiceData(rows);
      toast.success(`Invoice ledger loaded — ${rows.length} records`);
    });
  };

  /* Compare */
  const handleCompare = async () => {
    if (!bankData.length || !invoiceData.length) {
      toast.error('Upload both files (or load the demo dataset) first.');
      return;
    }
    setIsComparing(true);
    try {
      const res = await api.post('/batches/compare', { bankData, invoiceData });
      if (res.data.success) {
        const { totalCompared, matchedCount, differenceCount, matchRate, discrepancies, aiReport } = res.data.data;
        setTotalCompared(totalCompared);
        setMatchedCount(matchedCount);
        setDifferenceCount(differenceCount);
        setMatchRate(matchRate);
        setDiscrepancyList(discrepancies);
        setAiReport(aiReport);
        setHasCompared(true);
        toast.success('Reconciliation complete!');
      } else {
        toast.error(res.data.message || 'Comparison failed.');
      }
    } catch {
      toast.error('Comparison error — check backend connection.');
    } finally {
      setIsComparing(false);
    }
  };

  /* Demo dataset */
  const handleLoadDemo = () => {
    const mockBank: any[] = [];
    const mockInvoice: any[] = [];
    for (let i = 1; i <= 400; i++) {
      const id = `TXN-${String(i).padStart(4, '0')}`;
      const amt = Math.floor(Math.random() * 45000) + 5000;
      mockBank.push({ transaction_id: id, amount: amt });
      mockInvoice.push({ tx_id: id, value: amt });
    }
    mockBank.push({ transaction_id: 'TXN-0401', amount: 25000 });
    mockInvoice.push({ tx_id: 'TXN-0401', value: 25500 });
    for (let i = 402; i <= 460; i++) {
      const id = `TXN-${String(i).padStart(4, '0')}`;
      const base = Math.floor(Math.random() * 45000) + 5000;
      mockBank.push({ transaction_id: id, amount: base });
      mockInvoice.push({ tx_id: id, value: base + 500 });
    }
    for (let i = 461; i <= 480; i++) mockBank.push({ transaction_id: `TXN-${String(i).padStart(4, '0')}`, amount: 15000 });
    for (let i = 481; i <= 500; i++) mockInvoice.push({ tx_id: `TXN-${String(i).padStart(4, '0')}`, value: 18000 });

    setBankData(mockBank);
    setInvoiceData(mockInvoice);
    setBankFile(new File([''], 'bank_statement_demo.csv'));
    setInvoiceFile(new File([''], 'invoice_ledger_demo.csv'));
    setHasCompared(false);
    toast.success('Loaded 500-record demo dataset!');
  };

  /* Filtered results */
  const filteredDiscrepancies = discrepancyList.filter((d) => {
    const matchSearch = d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const rateColor = matchRate >= 90 ? 'text-emerald-600' : matchRate >= 70 ? 'text-amber-500' : 'text-rose-500';
  const rateBarColor = matchRate >= 90 ? 'bg-emerald-500' : matchRate >= 70 ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left font-sans antialiased">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center">
            <GitCompare className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-outfit">Reconciliation</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Audit and compare transactional data from different source ledgers side-by-side.</p>
          </div>
        </div>
        <button
          onClick={handleLoadDemo}
          className="flex items-center gap-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-600 hover:text-teal-700 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 shadow-none"
        >
          <Sparkles className="h-4 w-4 text-teal-500" />
          Load Demo Dataset
        </button>
      </div>

      {/* ── Upload Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DropZone
          label="Bank Statement"
          desc="Upload CSV or JSON banking transaction logs."
          icon={<Landmark className="h-6 w-6 text-teal-600" />}
          accentClass="bg-teal-50 border border-teal-100"
          file={bankFile}
          recordCount={bankData.length}
          inputRef={bankInputRef}
          onChange={handleBankFileChange}
          onClear={() => { setBankFile(null); setBankData([]); }}
        />
        <DropZone
          label="Invoice Ledger"
          desc="Upload CSV or JSON invoice ledger logs."
          icon={<FileText className="h-6 w-6 text-violet-600" />}
          accentClass="bg-violet-50 border border-violet-100"
          file={invoiceFile}
          recordCount={invoiceData.length}
          inputRef={invoiceInputRef}
          onChange={handleInvoiceFileChange}
          onClear={() => { setInvoiceFile(null); setInvoiceData([]); }}
        />
      </div>

      {/* ── Readiness Banner ── */}
      {(bankData.length > 0 || invoiceData.length > 0) && (
        <div className="bg-white border border-slate-100 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6 text-xs">
            <span className={`flex items-center gap-1.5 font-bold ${bankData.length ? 'text-emerald-600' : 'text-slate-400'}`}>
              {bankData.length ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              Bank: {bankData.length ? `${bankData.length} records` : 'Not loaded'}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className={`flex items-center gap-1.5 font-bold ${invoiceData.length ? 'text-emerald-600' : 'text-slate-400'}`}>
              {invoiceData.length ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              Invoice: {invoiceData.length ? `${invoiceData.length} records` : 'Not loaded'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {bankData.length && invoiceData.length ? '✓ Ready to compare' : 'Upload both files to compare'}
          </span>
        </div>
      )}

      {/* ── Compare Button ── */}
      <div className="flex justify-center py-2">
        <button
          onClick={handleCompare}
          disabled={isComparing || !bankData.length || !invoiceData.length}
          className="flex items-center gap-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl px-8 py-3.5 shadow-lg shadow-teal-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isComparing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running Reconciliation…
            </>
          ) : (
            <>
              <ArrowLeftRight className="h-4 w-4" />
              Compare Files
            </>
          )}
        </button>
      </div>

      {/* ── Results Section ── */}
      {hasCompared && (
        <div className="space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Match Rate */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Rate</span>
                <TrendingUp className="h-4 w-4 text-teal-500" />
              </div>
              <p className={`text-3xl font-black font-outfit ${rateColor}`}>{matchRate}%</p>
              <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${rateBarColor}`} style={{ width: `${matchRate}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Target ≥ 90%</p>
            </div>

            {/* Records */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Records</span>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-3xl font-black text-slate-800 font-outfit">{totalCompared}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Total Compared</p>
            </div>

            {/* Matched */}
            <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Matched</span>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-emerald-600 font-outfit">{matchedCount}</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1.5">Perfect Matches</p>
            </div>

            {/* Differences */}
            <div className="bg-white border border-rose-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Exceptions</span>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              </div>
              <p className="text-3xl font-black text-rose-600 font-outfit">{differenceCount}</p>
              <p className="text-[10px] text-rose-400 font-semibold mt-1.5">Discrepancies Found</p>
            </div>
          </div>

          {/* AI Report */}
          {aiReport && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide font-outfit">AI Reconciliation Audit Report</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Generated by Llama-3.1 via Groq</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {aiReport}
              </div>
            </div>
          )}

          {/* Discrepancy Audit Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-5">
            {/* Table header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-teal-500" />
                <div>
                  <h4 className="text-sm font-black text-slate-800 font-outfit">Discrepancy Audit Log</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Review exact discrepancies between statement and ledger.</p>
                </div>
              </div>

              {/* Search + Filter */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Txn ID…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-xl pl-8 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition font-semibold"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="mismatch">Mismatch</option>
                  <option value="missing_invoice">Missing Invoice</option>
                  <option value="missing_bank">Missing Bank</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Transaction ID', 'Bank Amount', 'Invoice Amount', 'Difference', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDiscrepancies.length > 0 ? (
                    filteredDiscrepancies.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-black text-slate-800 font-mono text-[11px]">{d.id}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono font-semibold">{fmtINR(d.bankAmount)}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono font-semibold">{fmtINR(d.invoiceAmount)}</td>
                        <td className="px-4 py-3 text-rose-600 font-bold font-mono">{fmtINR(d.difference)}</td>
                        <td className="px-4 py-3">{statusBadge(d.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                          <span className="text-sm font-bold text-slate-500">
                            {searchQuery || statusFilter !== 'all' ? 'No records match your filters.' : 'Perfect — no discrepancies found!'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {filteredDiscrepancies.length > 0 && (
              <p className="text-[10px] text-slate-400 font-semibold pt-2 border-t border-slate-50">
                Showing {filteredDiscrepancies.length} of {discrepancyList.length} discrepancies
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareFiles;
