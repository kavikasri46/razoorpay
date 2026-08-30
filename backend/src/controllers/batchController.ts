import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { parseUploadedFile } from '../utils/fileParser';

const prisma = new PrismaClient();

// Helper to clean key strings for matching
const cleanKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Auto-detect columns based on header keys
function detectColumns(keys: string[]): Record<string, string> {
  const mapping: Record<string, string> = {
    amount: '',
    date: '',
    description: '',
    reference: '',
    transactionId: '',
    currency: ''
  };

  for (const key of keys) {
    const k = cleanKey(key);
    if (!mapping.amount && (k === 'amount' || k === 'amt' || k === 'value' || k === 'sum' || k === 'price' || k.includes('amount') || k.includes('value'))) {
      mapping.amount = key;
    } else if (!mapping.date && (k === 'date' || k === 'txndate' || k === 'transactiondate' || k === 'timestamp' || k.includes('date') || k.includes('time'))) {
      mapping.date = key;
    } else if (!mapping.description && (k === 'description' || k === 'desc' || k === 'narration' || k === 'remarks' || k === 'particulars' || k.includes('desc'))) {
      mapping.description = key;
    } else if (!mapping.reference && (k === 'reference' || k === 'ref' || k === 'refno' || k === 'utr' || k === 'rrn' || k.includes('ref') || k === 'utrno')) {
      mapping.reference = key;
    } else if (!mapping.transactionId && (k === 'transactionid' || k === 'txnid' || k === 'id' || k === 'txid' || k.includes('id') || k.includes('tx'))) {
      mapping.transactionId = key;
    } else if (!mapping.currency && (k === 'currency' || k === 'curr' || k === 'ccy')) {
      mapping.currency = key;
    }
  }

  return mapping;
}

// Validate a single row
async function validateRow(
  row: any,
  mapping: Record<string, string>,
  existingRefs: Set<string>,
  existingTxIds: Set<string>,
  batchRefs: Set<string>,
  batchTxIds: Set<string>
) {
  const errors: string[] = [];

  // 1. Amount Validation
  const amountKey = mapping.amount;
  const amountVal = amountKey ? row[amountKey] : null;
  let parsedAmount: number | null = null;

  if (amountVal === undefined || amountVal === null || amountVal === '') {
    errors.push('missing_amount');
  } else {
    parsedAmount = parseFloat(String(amountVal).replace(/[^0-9.-]/g, ''));
    if (isNaN(parsedAmount)) {
      errors.push('invalid_amount');
    } else if (parsedAmount <= 0) {
      errors.push('negative_amount');
    }
  }

  // 2. Date Validation
  const dateKey = mapping.date;
  const dateVal = dateKey ? row[dateKey] : null;
  let parsedDate: Date | null = null;

  if (!dateVal) {
    errors.push('missing_date');
  } else {
    parsedDate = new Date(String(dateVal));
    if (isNaN(parsedDate.getTime())) {
      errors.push('invalid_date');
      parsedDate = null;
    }
  }

  // 3. Currency Validation
  const currencyKey = mapping.currency;
  const currencyVal = currencyKey ? String(row[currencyKey]).trim().toUpperCase() : 'INR';
  const validCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];
  if (currencyKey && row[currencyKey] && !validCurrencies.includes(currencyVal)) {
    errors.push('invalid_currency');
  }

  // 4. Transaction ID Validation
  const txIdKey = mapping.transactionId;
  const txIdVal = txIdKey ? String(row[txIdKey]).trim() : '';
  if (!txIdVal) {
    errors.push('empty_transaction_id');
  }

  // 5. Reference / Duplicate Check
  const refKey = mapping.reference;
  const refVal = refKey ? String(row[refKey]).trim() : '';

  let isDuplicate = false;
  if (refVal) {
    if (existingRefs.has(refVal) || batchRefs.has(refVal)) {
      isDuplicate = true;
    }
  }
  if (txIdVal) {
    if (existingTxIds.has(txIdVal) || batchTxIds.has(txIdVal)) {
      isDuplicate = true;
    }
  }

  if (refVal) batchRefs.add(refVal);
  if (txIdVal) batchTxIds.add(txIdVal);

  return {
    parsedDate,
    parsedAmount,
    currency: currencyVal,
    reference: refVal,
    transactionId: txIdVal,
    errors,
    isDuplicate
  };
}

export async function uploadBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;

    // ── Accept either multipart/form-data (real file) OR legacy JSON body ──
    let rawData: any[] = [];
    let filename = '';
    let sourceType = '';

    if (req.file) {
      // Multipart upload from frontend FormData
      filename   = req.file.originalname;
      sourceType = req.body.sourceType ?? 'BANK_STATEMENT';

      const { rows, error } = await parseUploadedFile(req.file.buffer, filename);
      if (error) {
        res.status(400).json({ success: false, message: error }); return;
      }
      rawData = rows;
    } else {
      // Fallback: legacy JSON body
      filename   = req.body.filename;
      sourceType = req.body.sourceType;
      rawData    = req.body.rawData;
    }

    if (!filename || !sourceType || !Array.isArray(rawData) || rawData.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid payload: file or rawData is required, along with sourceType.',
      }); return;
    }

    // Auto detect headers
    const sampleRow = rawData[0];
    const headers = Object.keys(sampleRow);
    const mapping = detectColumns(headers);

    // Fetch existing records for duplicate reference checking
    const dbRecords = await prisma.financialRecord.findMany({
      where: { batch: { userId } },
      select: { reference: true, transactionId: true }
    });

    const existingRefs   = new Set(dbRecords.map(r => r.reference).filter(Boolean) as string[]);
    const existingTxIds  = new Set(dbRecords.map(r => r.transactionId).filter(Boolean) as string[]);
    const batchRefs      = new Set<string>();
    const batchTxIds     = new Set<string>();

    const validatedRecords: any[] = [];
    let duplicatesCount = 0;
    let hasErrors = false;

    for (const row of rawData) {
      const val = await validateRow(row, mapping, existingRefs, existingTxIds, batchRefs, batchTxIds);
      if (val.isDuplicate) duplicatesCount++;
      if (val.errors.length > 0) hasErrors = true;
      validatedRecords.push({
        transactionId: val.transactionId,
        date: val.parsedDate,
        amount: val.parsedAmount,
        currency: val.currency,
        reference: val.reference,
        description: mapping.description ? String(row[mapping.description] || '') : '',
        status: val.errors.length > 0 ? 'INVALID' : 'VALID',
        validationErrors: val.errors,
        isDuplicate: val.isDuplicate,
        rawData: row
      });
    }

    const batch = await prisma.analysisBatch.create({
      data: {
        userId,
        filename,
        sourceType,
        recordCount: rawData.length,
        processingStatus: 'PROCESSING',
        validationStatus: hasErrors ? 'WARNINGS' : 'VALID',
        records: {
          create: validatedRecords.map(r => ({
            transactionId: r.transactionId,
            date: r.date,
            amount: r.amount,
            currency: r.currency,
            reference: r.reference,
            description: r.description,
            status: r.status,
            validationErrors: r.validationErrors
          }))
        }
      },
      include: { records: { take: 50 } }
    });

    await prisma.analysisBatch.update({
      where: { id: batch.id },
      data: { processingStatus: 'COMPLETED' }
    });

    res.status(201).json({
      success: true,
      data: {
        batch: {
          id: batch.id,
          filename: batch.filename,
          sourceType: batch.sourceType,
          recordCount: batch.recordCount,
          processingStatus: 'COMPLETED',
          validationStatus: batch.validationStatus,
          createdAt: batch.createdAt
        },
        detectedMapping: mapping,
        previewRecords: batch.records,
        duplicatesCount,
        hasValidationErrors: hasErrors
      }
    });

  } catch (error) {
    next(error);
  }
}


export async function importBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { duplicateAction } = req.body; // 'SKIP' or 'IMPORT_ALL'

    const batch = await prisma.analysisBatch.findFirst({
      where: { id, userId },
      include: { records: true }
    });

    if (!batch) {
      res.status(404).json({ success: false, message: 'Analysis batch not found.' }); return;
    }

    // Fetch existing transaction references to do the duplicate action
    const dbRecords = await prisma.financialRecord.findMany({
      where: {
        batch: { userId },
        NOT: { batchId: id }
      },
      select: {
        reference: true,
        transactionId: true
      }
    });

    const existingRefs = new Set(dbRecords.map(r => r.reference).filter(Boolean) as string[]);
    const existingTxIds = new Set(dbRecords.map(r => r.transactionId).filter(Boolean) as string[]);

    const duplicateIds: string[] = [];
    const validIds: string[] = [];

    for (const rec of batch.records) {
      const isDuplicate = 
        (rec.reference && existingRefs.has(rec.reference)) || 
        (rec.transactionId && existingTxIds.has(rec.transactionId));

      if (isDuplicate && duplicateAction === 'SKIP') {
        duplicateIds.push(rec.id);
      } else {
        validIds.push(rec.id);
      }
    }

    const importedCount = validIds.length;

    // Execute import transaction
    await prisma.$transaction(async (tx) => {
      if (duplicateIds.length > 0) {
        await tx.financialRecord.updateMany({
          where: { id: { in: duplicateIds } },
          data: {
            status: 'INVALID',
            validationErrors: ['skipped_duplicate']
          }
        });
      }

      if (validIds.length > 0) {
        await tx.financialRecord.updateMany({
          where: { id: { in: validIds } },
          data: {
            status: 'VALID'
          }
        });
      }

      // Update final batch status
      await tx.analysisBatch.update({
        where: { id: batch.id },
        data: {
          processingStatus: 'COMPLETED',
          recordCount: importedCount
        }
      });
    }, {
      timeout: 30000 // 30s timeout limit
    });

    res.status(200).json({
      success: true,
      message: `${importedCount} financial records added successfully.`,
      data: {
        importedCount,
        batchId: batch.id
      }
    });

  } catch (error) {
    next(error);
  }
}

export async function getBatches(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;

    const batches = await prisma.analysisBatch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { batches }
    });
  } catch (error) {
    next(error);
  }
}

export async function getBatchById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const batch = await prisma.analysisBatch.findFirst({
      where: { id, userId },
      include: {
        records: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!batch) {
      res.status(404).json({ success: false, message: 'Analysis batch not found.' }); return;
    }

    res.status(200).json({
      success: true,
      data: { batch }
    });
  } catch (error) {
    next(error);
  }
}

export async function compareStatements(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { bankData, invoiceData } = req.body;

    if (!Array.isArray(bankData) || !Array.isArray(invoiceData)) {
      res.status(400).json({ success: false, message: 'Invalid payload: bankData and invoiceData arrays are required.' }); return;
    }

    const idKeys = ['txid', 'transactionid', 'id', 'reference', 'utrref', 'utr', 'ref', 'transaction_id', 'tx_id'];
    const amountKeys = ['amount', 'amt', 'value', 'sum', 'price'];

    const getFieldVal = (obj: any, keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(obj).find(x => x.toLowerCase().replace(/[^a-z0-9]/g, '') === k);
        if (found) return obj[found];
      }
      return null;
    };

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
    const discrepancies: any[] = [];

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

    const finalMatchRate = Math.min(100, total > 0 ? Math.round((matched / total) * 100) : 100);

    // Call Groq Llama 3.1 AI auditor
    const { generateReconciliationReport } = require('../services/aiService');
    const aiReport = await generateReconciliationReport(userId, {
      total,
      matched,
      differences: diffCount,
      matchRate: finalMatchRate
    }, discrepancies);

    res.status(200).json({
      success: true,
      data: {
        totalCompared: total,
        matchedCount: matched,
        differenceCount: diffCount,
        matchRate: finalMatchRate,
        discrepancies,
        aiReport
      }
    });

  } catch (error) {
    next(error);
  }
}
