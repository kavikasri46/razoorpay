import React, { useState, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';
import { api } from '../services/api';
import { 
  Database, 
  UploadCloud, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  Check, 
  AlertCircle
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

export const AddFinancialData: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [sourceType, setSourceType] = useState<string>('');
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedData, setProcessedData] = useState<any>(null);
  
  // Mapping State
  const [mapping, setMapping] = useState<Record<string, string>>({
    amount: '',
    date: '',
    description: '',
    reference: '',
    transactionId: '',
    currency: ''
  });
  
  // Duplicate Resolution State
  const [duplicateAction, setDuplicateAction] = useState<string>('SKIP');
  const [importProgress, setImportProgress] = useState<number>(0);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataTypes = [
    { id: 'BANK_STATEMENT', title: 'Bank Statement', desc: 'Import transaction records from your corporate bank account.' },
    { id: 'INVOICES', title: 'Invoices', desc: 'Import receivable and payable invoices issued or received.' },
    { id: 'PAYMENTS', title: 'Payments', desc: 'Import raw payment transaction ledgers from payment gateways.' },
    { id: 'RAZORPAY_SETTLEMENTS', title: 'Razorpay Settlements', desc: 'Import settlement logs and payouts from Razorpay.' },
  ];

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'json' && ext !== 'xlsx') {
      toast.error('Unsupported file format. Please upload CSV, XLSX or JSON.');
      return;
    }
    
    setFile(selectedFile);
    setStep(2);
    
    // Simulate upload progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      if (prog >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        processFile(selectedFile);
      } else {
        setUploadProgress(prog);
      }
    }, 100);
  };

  const processFile = (selectedFile: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        let parsedRows: any[] = [];
        
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'json') {
          parsedRows = JSON.parse(text);
        } else {
          parsedRows = parseCSV(text);
        }

        if (parsedRows.length === 0) {
          throw new Error('No records found in this file.');
        }

        const response = await api.post('/batches/upload', {
          filename: selectedFile.name,
          sourceType,
          rawData: parsedRows
        });

        if (response.data.success) {
          setProcessedData(response.data.data);
          setMapping(response.data.data.detectedMapping);
          setStep(3);
        } else {
          toast.error(response.data.message || 'Failed to process file.');
          setStep(1);
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Parsing error. Verify file format.');
        setStep(1);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleMappingChange = (field: string, fileKey: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: fileKey
    }));
  };

  const isMappingUncertain = () => {
    return !mapping.amount || !mapping.date || !mapping.transactionId;
  };

  const handleProceedToImport = () => {
    setStep(4);
  };

  const startImport = async () => {
    if (!processedData?.batch?.id) return;
    
    setIsImporting(true);
    setImportProgress(0);
    
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 150));
      setImportProgress(Math.floor((i / steps) * 100));
    }

    try {
      const response = await api.post(`/batches/${processedData.batch.id}/import`, {
        duplicateAction,
        columnMapping: mapping
      });

      if (response.data.success) {
        setImportResult(response.data);
        setStep(5);
        toast.success('Financial data imported successfully!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const formatSourceType = (type: string) => {
    return type.toLowerCase().replace(/_/g, ' ');
  };

  const getValidationErrorMsg = (err: string) => {
    switch (err) {
      case 'missing_amount': return 'Amount is empty';
      case 'invalid_amount': return 'Invalid numeric format';
      case 'negative_amount': return 'Amount is negative/zero';
      case 'missing_date': return 'Date is empty';
      case 'invalid_date': return 'Unparseable date';
      case 'invalid_currency': return 'Unsupported currency';
      case 'empty_transaction_id': return 'Empty transaction ID';
      case 'skipped_duplicate': return 'Skipped duplicate';
      default: return err;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left font-sans text-slate-800 antialiased">
      {/* Header */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
        <h2 className="text-xl font-black text-slate-900 tracking-tight font-outfit">Add Financial Data</h2>
        <p className="text-xs text-slate-500 mt-1 font-semibold">Upload and organize transactional ledgers for the Finance Controller.</p>
      </div>

      {/* Stepper Status Bar */}
      {step <= 4 && (
        <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
          {[
            { num: 1, label: 'Choose' },
            { num: 2, label: 'Upload' },
            { num: 3, label: 'Review' },
            { num: 4, label: 'Import' }
          ].map((s, idx, arr) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num 
                    ? 'bg-teal-650 text-white shadow-md shadow-teal-600/10 scale-110' 
                    : step > s.num 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-105' 
                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                }`}>
                  {step > s.num ? <Check className="h-3 w-3" /> : s.num}
                </span>
                <span className={`text-xs font-bold ${step === s.num ? 'text-slate-900 font-extrabold' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div className="flex-1 h-[2px] bg-slate-100 mx-4 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* STEP 1: CHOOSE DATA TYPE */}
      {step === 1 && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-100 p-8 text-center flex flex-col items-center rounded-2xl shadow-sm">
            <Database className="h-10 w-10 text-teal-600 mb-3" />
            <h3 className="text-sm font-black text-slate-900 font-outfit mb-1.5 uppercase tracking-wide">Select Data Source Type</h3>
            <p className="text-xs text-slate-500 max-w-md font-medium">Choose the type of financial ledger you want to import into your company's accounting pipeline.</p>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataTypes.map((type) => (
              <Card 
                key={type.id} 
                className={`bg-white border p-6 flex flex-col justify-between hover:border-teal-500/50 hover:bg-slate-50/30 cursor-pointer transition-all duration-300 rounded-2xl shadow-sm ${
                  sourceType === type.id ? 'border-teal-500 ring-1 ring-teal-500/10 bg-teal-50/10' : 'border-slate-200/80'
                }`}
                onClick={() => setSourceType(type.id)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-800 tracking-wide font-outfit">{type.title}</span>
                    <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                      sourceType === type.id ? 'border-teal-650 bg-teal-650 text-white' : 'border-slate-300'
                    }`}>
                      {sourceType === type.id && <Check className="h-2.5 w-2.5" />}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{type.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              disabled={!sourceType} 
              onClick={() => triggerFileInput()}
              className="bg-teal-650 hover:bg-teal-750 text-white text-xs font-bold rounded-xl px-5 py-2.5 shadow-sm border-0 flex items-center gap-1.5"
            >
              Next: Upload File
              <ArrowRight className="h-4 w-4" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".csv,.json"
            />
          </div>
        </div>
      )}

      {/* STEP 2: UPLOAD PROGRESS */}
      {step === 2 && (
        <Card className="bg-white border-slate-100 p-12 flex flex-col items-center text-center justify-center space-y-6 min-h-[300px] rounded-3xl shadow-sm">
          {isProcessing ? (
            <>
              <RefreshCw className="h-10 w-10 text-teal-600 animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1 font-outfit">Processing Records...</h4>
                <p className="text-xs text-slate-500 font-semibold">Checking column headers and auditing database duplicates.</p>
              </div>
            </>
          ) : (
            <>
              <UploadCloud className="h-10 w-10 text-teal-600 animate-pulse" />
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-bold">
                  <span>Uploading {file?.name}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                  <div className="bg-teal-600 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* STEP 3: COLUMN MAPPING & PREVIEW */}
      {step === 3 && processedData && (
        <div className="space-y-6">
          {/* Warning banner if mapping is uncertain */}
          {isMappingUncertain() ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-left">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800">Please review fields mapping</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-semibold">
                  We could not automatically resolve some column headers. Ensure that at least **Amount**, **Date**, and **Transaction ID** are mapped correctly to prevent import issues.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-left">
              <Info className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-800">Columns Auto-Detected</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-semibold">
                  All major fields mapped automatically. Verify the preview table and mapping below before proceeding.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Column Mapping Selectors */}
            <Card className="bg-white border-slate-100 p-6 space-y-4 lg:col-span-1 rounded-2xl shadow-sm">
              <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase border-b border-slate-100 pb-3 font-outfit">Field Mapping</h3>
              
              {Object.keys(mapping).map((field) => {
                const availableHeaders = Object.keys(file ? processedData.previewRecords[0] : {});
                return (
                  <div key={field} className="text-left space-y-1.5">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {field === 'transactionId' ? 'Transaction ID' : field}
                      {['amount', 'date', 'transactionId'].includes(field) && <span className="text-teal-600 ml-0.5 font-bold">*</span>}
                    </label>
                    <select
                      value={mapping[field] || ''}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all font-bold cursor-pointer"
                    >
                      <option value="">-- Ignore Field --</option>
                      {availableHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    {mapping[field] ? (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-bold">
                        <Check className="h-3 w-3" /> Mapped to "{mapping[field]}"
                      </span>
                    ) : ['amount', 'date', 'transactionId'].includes(field) ? (
                      <span className="text-[10px] text-amber-600 flex items-center gap-1 mt-1 font-bold">
                        <AlertCircle className="h-3 w-3" /> Required field is unmapped
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </Card>

            {/* Right: Preview Grid & Validation Errors */}
            <div className="lg:col-span-2 space-y-6">
              {/* Validation Summary Card */}
              <Card className="bg-white border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 font-outfit">Validation Report</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">Found {processedData.batch.recordCount} total records in file.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center min-w-[90px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Duplicates</p>
                    <p className={`text-base font-black mt-0.5 font-outfit ${processedData.duplicatesCount > 0 ? 'text-amber-650' : 'text-slate-800'}`}>
                      {processedData.duplicatesCount}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center min-w-[90px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Errors</p>
                    <p className={`text-base font-black mt-0.5 font-outfit ${processedData.hasValidationErrors ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {processedData.hasValidationErrors ? 'Yes' : 'None'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Data Preview Table */}
              <Card className="bg-white border-slate-100 p-6 text-left space-y-4 rounded-2xl shadow-sm">
                <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase font-outfit">File Preview (First 5 Rows)</h4>
                
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px] font-bold">
                      <tr>
                        {Object.keys(processedData.previewRecords[0] || {}).map((header) => (
                          <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {processedData.previewRecords.slice(0, 5).map((rec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          {Object.values(rec).map((val: any, vIdx: number) => (
                            <td key={vIdx} className="px-4 py-3 text-slate-650 truncate max-w-[150px]">
                              {val !== null ? String(val) : <span className="text-slate-400 font-bold">NULL</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Row validation checks list (if any errors exist) */}
              {processedData.hasValidationErrors && (
                <Card className="bg-white border-slate-105 p-6 text-left space-y-3 rounded-2xl shadow-sm">
                  <h4 className="text-xs font-black text-rose-600 uppercase flex items-center gap-1.5 font-outfit">
                    <AlertCircle className="h-4 w-4" /> Detected Validation Exceptions
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {processedData.previewRecords
                      .filter((r: any) => r.validationErrors && r.validationErrors.length > 0)
                      .map((r: any, idx: number) => (
                        <div key={idx} className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 text-xs flex justify-between">
                          <span className="text-slate-500 font-bold">Txn Ref: {r.reference || r.transactionId || `Row ${idx + 1}`}</span>
                          <div className="flex gap-1.5">
                            {r.validationErrors.map((err: string) => (
                              <Badge key={err} variant="danger">{getValidationErrorMsg(err)}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <Button onClick={() => setStep(1)} className="bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-bold rounded-xl px-4 py-2.5 shadow-none border-0">
              Back
            </Button>
            <Button 
              disabled={isMappingUncertain()} 
              onClick={handleProceedToImport}
              className="bg-teal-650 hover:bg-teal-750 text-white text-xs font-bold rounded-xl px-5 py-2.5 shadow-sm border-0 flex items-center gap-1.5"
            >
              Continue to Import
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: RESOLVE DUPLICATES & IMPORT PROGRESS */}
      {step === 4 && processedData && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {isImporting ? (
            <Card className="bg-white border-slate-100 p-12 flex flex-col items-center text-center justify-center space-y-6 rounded-3xl shadow-sm">
              <RefreshCw className="h-10 w-10 text-teal-600 animate-spin" />
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-bold">
                  <span>Importing Records into Database...</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                  <div className="bg-teal-600 h-full transition-all duration-150" style={{ width: `${importProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium pt-1">Processing records safety write: checking duplicates constraints.</p>
              </div>
            </Card>
          ) : (
            <Card className="bg-white border-slate-100 p-8 space-y-6 text-left rounded-3xl shadow-sm">
              <div>
                <h3 className="text-sm font-black text-slate-800 font-outfit mb-1">Finalize Import</h3>
                <p className="text-xs text-slate-500 font-semibold">Configure how we should resolve existing financial transactions.</p>
              </div>

              {/* Duplicates Alert Box */}
              {processedData.duplicatesCount > 0 ? (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-800">
                        {processedData.duplicatesCount} duplicate records found
                      </h4>
                      <p className="text-[11px] text-slate-650 mt-0.5 leading-relaxed font-semibold">
                        There are {processedData.duplicatesCount} records in this file that already exist in your company's database history. What would you like to do?
                      </p>
                    </div>
                  </div>

                  <div className="pl-7 space-y-2.5 pt-2 border-t border-slate-200/60">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dupAction" 
                        value="SKIP"
                        checked={duplicateAction === 'SKIP'}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="accent-teal-600 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Skip duplicates (Recommended)</span>
                        <p className="text-[10px] text-slate-500 font-semibold">Only import new, unique records. Avoids duplicating financial accounting logs.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dupAction" 
                        value="IMPORT_ALL"
                        checked={duplicateAction === 'IMPORT_ALL'}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="accent-teal-600 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Import as new records</span>
                        <p className="text-[10px] text-slate-500 font-semibold">Force import all records, creating potential duplicate instances.</p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-left">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800">No duplicates found</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-semibold">
                      All records are unique. We will import them straight into the PostgreSQL database.
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <Button onClick={() => setStep(3)} className="bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-bold rounded-xl px-4 py-2.5 shadow-none border-0">
                  Back
                </Button>
                <Button onClick={startImport} className="bg-teal-650 hover:bg-teal-750 text-white text-xs font-bold rounded-xl px-5 py-2.5 shadow-sm border-0 flex items-center gap-1.5">
                  Import Financial Data
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* STEP 5: SUCCESS STATE SCREEN */}
      {step === 5 && importResult && (
        <Card className="bg-white border border-slate-200/60 p-12 flex flex-col items-center text-center justify-center space-y-6 max-w-xl mx-auto rounded-3xl shadow-xl">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center scale-110 shadow-md">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-800 font-outfit">
              {importResult.data.importedCount} {formatSourceType(processedData.batch.sourceType)} records added.
            </h3>
            <p className="text-xs text-slate-500 font-semibold max-w-sm">
              The financial records have been parsed, validated, and safely stored in your ledger database.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 border-t border-slate-100">
            <Button className="flex-1 bg-teal-650 hover:bg-teal-750 text-white rounded-xl font-bold py-2.5 text-xs shadow-sm border-0" onClick={() => toast.info('Reconciliation engine started in background.')}>
              Run Reconciliation
            </Button>
            <Button 
              onClick={() => {
                setStep(1);
                setSourceType('');
                setFile(null);
                setProcessedData(null);
                setImportResult(null);
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold py-2.5 text-xs shadow-none border-0"
            >
              Upload More Data
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AddFinancialData;
