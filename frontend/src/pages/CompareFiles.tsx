import React, { useState, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import { 
  ArrowLeftRight, 
  RefreshCw, 
  Search, 
  Sparkles,
  FileSpreadsheet,
  Check
} from 'lucide-react';

// Custom CSV Parser
function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = splitCSVLine(lines[0]);
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : null;
    });
    rows.push(row);
  }
  return rows;
}

function splitCSVLine(line: string) {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, ''));
}

interface Discrepancy {
  id: string;
  bankAmount: number | string;
  invoiceAmount: number | string;
  difference: number | string;
  status: 'mismatch' | 'missing_invoice' | 'missing_bank';
  description: string;
}

export const CompareFiles: React.FC = () => {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  
  const [bankData, setBankData] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [hasCompared, setHasCompared] = useState<boolean>(false);
  
  // Results
  const [totalCompared, setTotalCompared] = useState<number>(0);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [differenceCount, setDifferenceCount] = useState<number>(0);
  const [matchRate, setMatchRate] = useState<number>(0);
  const [discrepancyList, setDiscrepancyList] = useState<Discrepancy[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const bankInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleBankFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setBankFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = file.name.endsWith('.json') ? JSON.parse(text) : parseCSV(text);
          setBankData(parsed);
          toast.success(`Loaded bank statement: ${parsed.length} rows`);
        } catch {
          toast.error('Failed to parse bank statement file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setInvoiceFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = file.name.endsWith('.json') ? JSON.parse(text) : parseCSV(text);
          setInvoiceData(parsed);
          toast.success(`Loaded invoices: ${parsed.length} rows`);
        } catch {
          toast.error('Failed to parse invoices file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Auto-helper mapping keys
  const getFieldVal = (obj: any, keys: string[]) => {
    for (const k of keys) {
      const found = Object.keys(obj).find(x => x.toLowerCase().replace(/[^a-z0-9]/g, '') === k);
      if (found) return obj[found];
    }
    return null;
  };

  // Compare Files Logic
  const handleCompare = () => {
    if (bankData.length === 0 || invoiceData.length === 0) {
      toast.error('Please upload both files or load the demo dataset first.');
      return;
    }

    setIsComparing(true);
    
    setTimeout(() => {
      // Keys to look for identifiers
      const idKeys = ['txid', 'transactionid', 'id', 'reference', 'utrref', 'utr', 'ref'];
      const amountKeys = ['amount', 'amt', 'value', 'sum', 'price'];

      const bankMap = new Map<string, number>();
      bankData.forEach(row => {
        const idVal = String(getFieldVal(row, idKeys) || '').trim();
        const amtVal = parseFloat(String(getFieldVal(row, amountKeys) || '0').replace(/[^0-9.-]/g, ''));
        if (idVal && !isNaN(amtVal)) {
          bankMap.set(idVal, amtVal);
        }
      });

      const invoiceMap = new Map<string, number>();
      invoiceData.forEach(row => {
        const idVal = String(getFieldVal(row, idKeys) || '').trim();
        const amtVal = parseFloat(String(getFieldVal(row, amountKeys) || '0').replace(/[^0-9.-]/g, ''));
        if (idVal && !isNaN(amtVal)) {
          invoiceMap.set(idVal, amtVal);
        }
      });

      const allIds = new Set([...bankMap.keys(), ...invoiceMap.keys()]);
      let total = allIds.size;
      let matched = 0;
      let diffCount = 0;
      const discrepancies: Discrepancy[] = [];

      allIds.forEach(id => {
        const inBank = bankMap.has(id);
        const inInvoice = invoiceMap.has(id);

        if (inBank && inInvoice) {
          const bankAmt = bankMap.get(id)!;
          const invAmt = invoiceMap.get(id)!;
          if (bankAmt === invAmt) {
            matched++;
          } else {
            diffCount++;
            discrepancies.push({
              id,
              bankAmount: bankAmt,
              invoiceAmount: invAmt,
              difference: Math.abs(bankAmt - invAmt),
              status: 'mismatch',
              description: "Amount doesn't match"
            });
          }
        } else if (inBank) {
          diffCount++;
          discrepancies.push({
            id,
            bankAmount: bankMap.get(id)!,
            invoiceAmount: '-',
            difference: '-',
            status: 'missing_invoice',
            description: 'Missing in Invoice'
          });
        } else if (inInvoice) {
          diffCount++;
          discrepancies.push({
            id,
            bankAmount: '-',
            invoiceAmount: invoiceMap.get(id)!,
            difference: '-',
            status: 'missing_bank',
            description: 'Missing in Bank'
          });
        }
      });

      setTotalCompared(total);
      setMatchedCount(matched);
      setDifferenceCount(diffCount);
      setMatchRate(Math.round((matched / total) * 100));
      setDiscrepancyList(discrepancies);
      setHasCompared(true);
      setIsComparing(false);
      toast.success('Comparison completed successfully!');
    }, 800);
  };

  // Demo Dataset Loader (exactly matching user example)
  const handleLoadDemo = () => {
    const mockBank: any[] = [];
    const mockInvoice: any[] = [];

    // 1. 400 Matched records
    for (let i = 1; i <= 400; i++) {
      const id = `TXN-${String(i).padStart(4, '0')}`;
      const amount = Math.floor(Math.random() * 45000) + 5000;
      mockBank.push({ transaction_id: id, amount });
      mockInvoice.push({ tx_id: id, value: amount });
    }

    // 2. 60 Discrepant amount records (e.g. TXN-0401 Bank: 25000 vs Invoice: 25500)
    mockBank.push({ transaction_id: 'TXN-0401', amount: 25000 });
    mockInvoice.push({ tx_id: 'TXN-0401', value: 25500 });
    
    for (let i = 402; i <= 460; i++) {
      const id = `TXN-${String(i).padStart(4, '0')}`;
      const baseAmount = Math.floor(Math.random() * 45000) + 5000;
      mockBank.push({ transaction_id: id, amount: baseAmount });
      mockInvoice.push({ tx_id: id, value: baseAmount + 500 }); // always diff by 500
    }

    // 3. 20 Missing in Invoice
    for (let i = 461; i <= 480; i++) {
      const id = `TXN-${String(i).padStart(4, '0')}`;
      mockBank.push({ transaction_id: id, amount: 15000 });
    }

    // 4. 20 Missing in Bank
    for (let i = 481; i <= 500; i++) {
      const id = `TXN-${String(i).padStart(4, '0')}`;
      mockInvoice.push({ tx_id: id, value: 18000 });
    }

    setBankData(mockBank);
    setInvoiceData(mockInvoice);
    setBankFile(new File([''], 'bank_statement_demo.csv'));
    setInvoiceFile(new File([''], 'invoice_ledger_demo.csv'));
    
    setHasCompared(false);
    toast.success('Loaded 500-record Demo Dataset!');
  };

  const filteredDiscrepancies = discrepancyList.filter(d => 
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans relative">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-cyan-600/5 via-blue-600/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Reconciliation</h2>
          <p className="text-xs text-slate-450 mt-1">Audit and compare transactional data from different source ledgers side-by-side.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLoadDemo}
          className="flex items-center gap-2 border-violet-500/20 text-violet-400 hover:bg-violet-950/10"
        >
          <Sparkles className="h-4 w-4" />
          Load Demo Dataset
        </Button>
      </div>

      {/* Upload Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Bank Statement Upload Card */}
        <Card className="bg-slate-950/40 border-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-violet-500/30 transition-all duration-350">
          <div className="h-12 w-12 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/25 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Bank Statement</h4>
            <p className="text-xs text-slate-450 mt-1">Upload CSV or JSON banking logs.</p>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => bankInputRef.current?.click()}>
            {bankFile ? 'Change File' : 'Upload File'}
          </Button>
          <input 
            type="file" 
            ref={bankInputRef} 
            onChange={handleBankFileChange} 
            className="hidden" 
            accept=".csv,.json"
          />
          {bankFile && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="h-3 w-3" /> {bankFile.name} ({bankData.length} records)
            </span>
          )}
        </Card>

        {/* Invoice Upload Card */}
        <Card className="bg-slate-950/40 border-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-cyan-500/30 transition-all duration-350">
          <div className="h-12 w-12 rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/25 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Invoice Ledger</h4>
            <p className="text-xs text-slate-450 mt-1">Upload CSV or JSON invoices logs.</p>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => invoiceInputRef.current?.click()}>
            {invoiceFile ? 'Change File' : 'Upload File'}
          </Button>
          <input 
            type="file" 
            ref={invoiceInputRef} 
            onChange={handleInvoiceFileChange} 
            className="hidden" 
            accept=".csv,.json"
          />
          {invoiceFile && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="h-3 w-3" /> {invoiceFile.name} ({invoiceData.length} records)
            </span>
          )}
        </Card>
      </div>

      {/* Compare Trigger Button */}
      <div className="flex justify-center pt-2 relative z-10">
        <Button 
          onClick={handleCompare} 
          disabled={isComparing || bankData.length === 0 || invoiceData.length === 0}
          className="px-8 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold border-0 shadow-lg shadow-indigo-600/15"
        >
          {isComparing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Comparing Files...
            </>
          ) : (
            <>
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Compare Files
            </>
          )}
        </Button>
      </div>

      {/* COMPARISON RESULTS SCREEN */}
      {hasCompared && (
        <div className="space-y-6 relative z-10">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Match Rate Card */}
            <Card className="bg-slate-900 border-slate-850 p-6 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Rate</span>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-2xl font-black text-white">{matchRate}%</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Target 90%+
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3 border border-slate-850">
                <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full" style={{ width: `${matchRate}%` }} />
              </div>
            </Card>

            {/* Total Compared Card */}
            <Card className="bg-slate-900 border-slate-850 p-6 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Records Compared</span>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-2xl font-black text-white">{totalCompared}</span>
                <span className="text-xs text-slate-400">Total Entries</span>
              </div>
            </Card>

            {/* Matched Count Card */}
            <Card className="bg-slate-900 border-slate-850 p-6 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matched</span>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-2xl font-black text-emerald-400">{matchedCount}</span>
                <span className="text-xs text-emerald-450">Perfect Matches</span>
              </div>
            </Card>

            {/* Differences Count Card */}
            <Card className="bg-slate-900 border-slate-850 p-6 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Differences</span>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-2xl font-black text-red-400">{differenceCount}</span>
                <span className="text-xs text-red-450">Discrepancies</span>
              </div>
            </Card>
          </div>

          {/* Audit List Table */}
          <Card className="bg-slate-900 border-slate-850 p-6 space-y-4 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Discrepancy Audit Log</h4>
                <p className="text-xs text-slate-450 mt-1">Review exact discrepancies found between your statement and ledger.</p>
              </div>
              
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
                <input 
                  type="text"
                  placeholder="Search Txn ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 placeholder:text-slate-600 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-850 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 border-b border-slate-850 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Transaction ID</th>
                    <th className="px-4 py-3 font-semibold">Bank Amount</th>
                    <th className="px-4 py-3 font-semibold">Invoice Amount</th>
                    <th className="px-4 py-3 font-semibold">Difference</th>
                    <th className="px-4 py-3 font-semibold">Status / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredDiscrepancies.length > 0 ? (
                    filteredDiscrepancies.map((d, index) => (
                      <tr key={index} className="hover:bg-slate-850/30">
                        <td className="px-4 py-3 font-semibold text-slate-200">{d.id}</td>
                        <td className="px-4 py-3 text-slate-300 font-mono">
                          {d.bankAmount !== '-' ? `₹${Number(d.bankAmount).toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">
                          {d.invoiceAmount !== '-' ? `₹${Number(d.invoiceAmount).toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-red-400 font-semibold font-mono">
                          {d.difference !== '-' ? `₹${Number(d.difference).toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {d.status === 'mismatch' ? (
                            <Badge variant="danger" className="text-[10px]">❌ {d.description}</Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px]">⚠️ {d.description}</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">
                        No discrepancies found. Complete match!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CompareFiles;
