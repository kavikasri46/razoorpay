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
  
  // Headers parsing
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
    
    // Simulate real-time upload progress
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
          // Parse CSV
          parsedRows = parseCSV(text);
        }

        if (parsedRows.length === 0) {
          throw new Error('No records found in this file.');
        }

        // Send to backend for column mapping and initial validation
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
    
    // Simulate import progress
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Add Financial Data</h2>
        <p className="text-xs text-slate-450 mt-1">Upload and organize transactional ledgers for the Finance Controller.</p>
      </div>

      {/* Stepper Status Bar */}
      {step <= 4 && (
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between shadow-lg">
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
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 scale-110' 
                    : step > s.num 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {step > s.num ? <Check className="h-3 w-3" /> : s.num}
                </span>
                <span className={`text-xs font-semibold ${step === s.num ? 'text-white' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div className="flex-1 h-[2px] bg-slate-800 mx-4 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* STEP 1: CHOOSE DATA TYPE */}
      {step === 1 && (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-850 p-8 text-center flex flex-col items-center">
            <Database className="h-10 w-10 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Select Data Source Type</h3>
            <p className="text-xs text-slate-400 max-w-md">Choose the type of financial ledger you want to import into your company's accounting pipeline.</p>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataTypes.map((type) => (
              <Card 
                key={type.id} 
                className={`bg-slate-900 border p-6 flex flex-col justify-between hover:border-cyan-500/40 hover:bg-slate-900/80 cursor-pointer transition-all duration-350 ${
                  sourceType === type.id ? 'border-cyan-500 ring-1 ring-cyan-500/20' : 'border-slate-850'
                }`}
                onClick={() => setSourceType(type.id)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white tracking-wide">{type.title}</span>
                    <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      sourceType === type.id ? 'border-cyan-500 bg-cyan-500 text-slate-950' : 'border-slate-700'
                    }`}>
                      {sourceType === type.id && <Check className="h-2.5 w-2.5" />}
                    </span>
                  </div>
                  <p className="text-xs text-slate-450 leading-relaxed">{type.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              disabled={!sourceType} 
              onClick={() => triggerFileInput()}
              className="flex items-center gap-2"
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
        <Card className="bg-slate-900 border-slate-850 p-12 flex flex-col items-center text-center justify-center space-y-6 min-h-[300px]">
          {isProcessing ? (
            <>
              <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Processing Records...</h4>
                <p className="text-xs text-slate-500">Checking column headers and auditing database duplicates.</p>
              </div>
            </>
          ) : (
            <>
              <UploadCloud className="h-10 w-10 text-cyan-400 animate-pulse" />
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Uploading {file?.name}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                  <div className="bg-cyan-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
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
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-left">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-400">Please review fields</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  We could not automatically resolve some column headers. Ensure that at least **Amount**, **Date**, and **Transaction ID** are mapped correctly to prevent import issues.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4 flex gap-3 text-left">
              <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-cyan-400">Columns Auto-Detected</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  All major fields mapped automatically. Verify the preview table and mapping below before proceeding.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Column Mapping Selectors */}
            <Card className="bg-slate-900 border-slate-850 p-6 space-y-4 lg:col-span-1">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase border-b border-slate-800 pb-3">Field Mapping</h3>
              
              {Object.keys(mapping).map((field) => {
                const availableHeaders = Object.keys(file ? processedData.previewRecords[0] : {});
                return (
                  <div key={field} className="text-left space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {field === 'transactionId' ? 'Transaction ID' : field}
                      {['amount', 'date', 'transactionId'].includes(field) && <span className="text-cyan-400 ml-1">*</span>}
                    </label>
                    <select
                      value={mapping[field] || ''}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="">-- Ignore Field --</option>
                      {availableHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    {mapping[field] ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                        <Check className="h-3 w-3" /> Mapped to "{mapping[field]}"
                      </span>
                    ) : ['amount', 'date', 'transactionId'].includes(field) ? (
                      <span className="text-[10px] text-amber-500 flex items-center gap-1 mt-1 font-medium">
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
              <Card className="bg-slate-900 border-slate-850 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Validation Report</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Found {processedData.batch.recordCount} total records in file.</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-slate-950 border border-slate-850 px-4 py-2 rounded-lg text-center min-w-[90px]">
                    <p className="text-xs text-slate-500">Duplicates</p>
                    <p className={`text-base font-bold mt-0.5 ${processedData.duplicatesCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                      {processedData.duplicatesCount}
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 px-4 py-2 rounded-lg text-center min-w-[90px]">
                    <p className="text-xs text-slate-500">Errors</p>
                    <p className={`text-base font-bold mt-0.5 ${processedData.hasValidationErrors ? 'text-red-400' : 'text-emerald-400'}`}>
                      {processedData.hasValidationErrors ? 'Yes' : 'None'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Data Preview Table */}
              <Card className="bg-slate-900 border-slate-850 p-6 text-left space-y-4">
                <h4 className="text-xs font-bold text-white tracking-wider uppercase">File Preview (First 5 Rows)</h4>
                
                <div className="overflow-x-auto border border-slate-850 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 border-b border-slate-850 text-slate-400 uppercase text-[10px]">
                      <tr>
                        {Object.keys(processedData.previewRecords[0] || {}).map((header) => (
                          <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {processedData.previewRecords.slice(0, 5).map((rec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-850/40">
                          {Object.values(rec).map((val: any, vIdx: number) => (
                            <td key={vIdx} className="px-4 py-3 text-slate-300 truncate max-w-[150px]">
                              {val !== null ? String(val) : <span className="text-slate-600">NULL</span>}
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
                <Card className="bg-slate-900 border-slate-850 p-6 text-left space-y-3">
                  <h4 className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Detected Validation Exceptions
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {processedData.previewRecords
                      .filter((r: any) => r.validationErrors && r.validationErrors.length > 0)
                      .map((r: any, idx: number) => (
                        <div key={idx} className="bg-red-950/10 border border-red-500/10 rounded-lg p-2 text-xs flex justify-between">
                          <span className="text-slate-400">Txn Ref: {r.reference || r.transactionId || `Row ${idx + 1}`}</span>
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
          <div className="flex justify-between items-center pt-6 border-t border-slate-900">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              disabled={isMappingUncertain()} 
              onClick={handleProceedToImport}
              className="flex items-center gap-2"
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
            <Card className="bg-slate-900 border-slate-850 p-12 flex flex-col items-center text-center justify-center space-y-6">
              <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Importing Records into Database...</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                  <div className="bg-cyan-500 h-full transition-all duration-150" style={{ width: `${importProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 pt-1">Processing records safety write: checking duplicates constraints.</p>
              </div>
            </Card>
          ) : (
            <Card className="bg-slate-900 border-slate-850 p-8 space-y-6 text-left">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Finalize Import</h3>
                <p className="text-xs text-slate-400">Configure how we should resolve existing financial transactions.</p>
              </div>

              {/* Duplicates Alert Box */}
              {processedData.duplicatesCount > 0 ? (
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-400">
                        {processedData.duplicatesCount} duplicate records found
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        There are {processedData.duplicatesCount} records in this file that already exist in your company's database history. What would you like to do?
                      </p>
                    </div>
                  </div>

                  <div className="pl-7 space-y-2.5 pt-2 border-t border-slate-800/40">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dupAction" 
                        value="SKIP"
                        checked={duplicateAction === 'SKIP'}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="accent-cyan-500 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white">Skip duplicates (Recommended)</span>
                        <p className="text-[10px] text-slate-500">Only import new, unique records. Avoids duplicating financial accounting logs.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dupAction" 
                        value="IMPORT_ALL"
                        checked={duplicateAction === 'IMPORT_ALL'}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="accent-cyan-500 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white">Import as new records</span>
                        <p className="text-[10px] text-slate-500">Force import all records, creating potential duplicate instances.</p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-4 flex gap-3 text-left">
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400">No duplicates found</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      All records are unique. We will import them straight into the PostgreSQL database.
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-900">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={startImport} className="flex items-center gap-2">
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
        <Card className="bg-slate-900 border-slate-850 p-12 flex flex-col items-center text-center justify-center space-y-6 max-w-xl mx-auto shadow-2xl">
          <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center scale-110 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              {importResult.data.importedCount} {formatSourceType(processedData.batch.sourceType)} records added.
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              The financial records have been parsed, validated, and safely stored in your ledger database.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 border-t border-slate-800/40">
            <Button className="flex-1" onClick={() => toast.info('Reconciliation engine started in background.')}>
              Run Reconciliation
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => {
                setStep(1);
                setSourceType('');
                setFile(null);
                setProcessedData(null);
                setImportResult(null);
              }}
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
