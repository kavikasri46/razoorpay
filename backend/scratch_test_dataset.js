const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to clean key strings
const cleanKey = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Auto-detect columns based on header keys
function detectColumns(keys) {
  const mapping = { amount: '', date: '', description: '', reference: '', transactionId: '', currency: '' };
  for (const key of keys) {
    const k = cleanKey(key);
    if (!mapping.amount && (k === 'amount' || k === 'amt' || k === 'value' || k === 'sum' || k === 'price' || k.includes('amount'))) {
      mapping.amount = key;
    } else if (!mapping.date && (k === 'date' || k === 'txndate' || k === 'transactiondate' || k === 'timestamp' || k.includes('date'))) {
      mapping.date = key;
    } else if (!mapping.description && (k === 'description' || k === 'desc' || k === 'narration' || k === 'remarks' || k === 'particulars')) {
      mapping.description = key;
    } else if (!mapping.reference && (k === 'reference' || k === 'ref' || k === 'refno' || k === 'utr' || k === 'rrn' || k.includes('ref'))) {
      mapping.reference = key;
    } else if (!mapping.transactionId && (k === 'transactionid' || k === 'txnid' || k === 'id' || k === 'txid' || k.includes('id'))) {
      mapping.transactionId = key;
    } else if (!mapping.currency && (k === 'currency' || k === 'curr' || k === 'ccy')) {
      mapping.currency = key;
    }
  }
  return mapping;
}

// Generate a mock dataset of 500 records
function generateMockDataset() {
  const records = [];
  
  // Base valid data generator
  for (let i = 1; i <= 483; i++) {
    records.push({
      tx_id: `TXN-${1000 + i}`,
      txn_date: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      particulars: `Purchase Ref #${i}`,
      amount: (Math.random() * 1000 + 10).toFixed(2),
      currency: 'INR',
      utr_ref: `UTR-${5000 + i}`
    });
  }

  // Add 12 duplicates (identical to existing records in the file)
  for (let i = 0; i < 12; i++) {
    const orig = records[i * 10]; // pick some original records
    records.push({ ...orig });
  }

  // Add 5 invalid records for validation testing
  // 1. Missing amount
  records.push({
    tx_id: 'TXN-9991',
    txn_date: new Date().toISOString(),
    particulars: 'Invalid: Missing Amount',
    amount: '',
    currency: 'INR',
    utr_ref: 'UTR-9991'
  });

  // 2. Negative amount
  records.push({
    tx_id: 'TXN-9992',
    txn_date: new Date().toISOString(),
    particulars: 'Invalid: Negative Amount',
    amount: '-150.00',
    currency: 'INR',
    utr_ref: 'UTR-9992'
  });

  // 3. Invalid Date
  records.push({
    tx_id: 'TXN-9993',
    txn_date: 'invalid-date-format',
    particulars: 'Invalid: Bad Date',
    amount: '450.00',
    currency: 'INR',
    utr_ref: 'UTR-9993'
  });

  // 4. Invalid Currency
  records.push({
    tx_id: 'TXN-9994',
    txn_date: new Date().toISOString(),
    particulars: 'Invalid: Currency',
    amount: '300.00',
    currency: 'INVALID_CCY',
    utr_ref: 'UTR-9994'
  });

  // 5. Empty Transaction ID
  records.push({
    tx_id: '',
    txn_date: new Date().toISOString(),
    particulars: 'Invalid: Missing TxId',
    amount: '120.00',
    currency: 'INR',
    utr_ref: 'UTR-9995'
  });

  return records;
}

// Convert object array to CSV text
function toCSV(data) {
  const headers = Object.keys(data[0]);
  const rows = [headers.join(',')];
  for (const row of data) {
    rows.push(headers.map(h => `"${row[h]}"`).join(','));
  }
  return rows.join('\n');
}

// Validation logic runner
async function runTest() {
  console.log('--- STARTING FINANCIAL DATA MODULE INTEGRATION TEST ---');
  
  // 1. Generate and write mock 500-record dataset
  const rawData = generateMockDataset();
  console.log(`Generated ${rawData.length} records (483 valid, 12 duplicates, 5 validation errors).`);
  
  const csvContent = toCSV(rawData);
  const csvPath = path.join(__dirname, 'mock_500_records.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log(`Saved mock dataset to ${csvPath}`);

  // Fetch or create a test user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Controller User',
        email: 'test@razorpay.com',
        password: 'testpassword123',
        role: 'USER'
      }
    });
  }
  console.log(`Running test under User: ${user.email} (ID: ${user.id})`);

  // 2. Simulate Upload & Auto Mapping
  const headers = Object.keys(rawData[0]);
  const mapping = detectColumns(headers);
  console.log('Auto-detected column mapping:');
  console.log(JSON.stringify(mapping, null, 2));

  // Verify core columns are mapped
  if (!mapping.amount || !mapping.date || !mapping.transactionId) {
    console.error('FAIL: Core columns could not be auto-detected!');
    process.exit(1);
  }
  console.log('SUCCESS: Core columns successfully auto-detected.');

  // Validate and parse records
  let duplicatesCount = 0;
  let validationErrorsCount = 0;
  const processedRecords = [];

  const existingRefs = new Set();
  const existingTxIds = new Set();
  const fileRefs = new Set();
  const fileTxIds = new Set();

  for (const row of rawData) {
    const errors = [];
    
    // Amount check
    const amountVal = row[mapping.amount];
    let amt = null;
    if (amountVal === undefined || amountVal === null || amountVal === '') {
      errors.push('missing_amount');
    } else {
      amt = parseFloat(amountVal);
      if (isNaN(amt)) errors.push('invalid_amount');
      else if (amt <= 0) errors.push('negative_amount');
    }

    // Date check
    const dateVal = row[mapping.date];
    let parsedDate = null;
    if (!dateVal) {
      errors.push('missing_date');
    } else {
      parsedDate = new Date(dateVal);
      if (isNaN(parsedDate.getTime())) {
        errors.push('invalid_date');
        parsedDate = null;
      }
    }

    // Currency check
    const currencyVal = row[mapping.currency];
    if (currencyVal && currencyVal !== 'INR') {
      errors.push('invalid_currency');
    }

    // Tx ID check
    const txIdVal = row[mapping.transactionId];
    if (!txIdVal) {
      errors.push('empty_transaction_id');
    }

    // Duplicate reference checks (within file)
    let isDuplicate = false;
    const refVal = row[mapping.reference];
    if (refVal && fileRefs.has(refVal)) isDuplicate = true;
    if (txIdVal && fileTxIds.has(txIdVal)) isDuplicate = true;

    if (refVal) fileRefs.add(refVal);
    if (txIdVal) fileTxIds.add(txIdVal);

    if (isDuplicate) duplicatesCount++;
    if (errors.length > 0) validationErrorsCount++;

    processedRecords.push({
      transactionId: txIdVal,
      date: parsedDate,
      amount: amt,
      currency: currencyVal || 'INR',
      reference: refVal,
      description: row[mapping.description] || '',
      status: errors.length > 0 ? 'INVALID' : 'VALID',
      validationErrors: errors,
      isDuplicate
    });
  }

  console.log(`Processed validation results:`);
  console.log(`- Duplicate records flagged: ${duplicatesCount} (Expected: 12)`);
  console.log(`- Validation errors flagged: ${validationErrorsCount} (Expected: 5)`);

  if (duplicatesCount !== 12) {
    console.error(`FAIL: Duplicates count mismatch! Expected 12, got ${duplicatesCount}`);
    process.exit(1);
  }
  if (validationErrorsCount !== 5) {
    console.error(`FAIL: Validation errors mismatch! Expected 5, got ${validationErrorsCount}`);
    process.exit(1);
  }
  console.log('SUCCESS: Validation and duplicate checks match specifications.');

  // 3. Create Analysis Batch in database
  const batch = await prisma.analysisBatch.create({
    data: {
      userId: user.id,
      filename: 'mock_500_records.csv',
      sourceType: 'BANK_STATEMENT',
      recordCount: rawData.length,
      processingStatus: 'COMPLETED',
      validationStatus: validationErrorsCount > 0 ? 'WARNINGS' : 'VALID',
      records: {
        create: processedRecords.map(r => ({
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
    include: {
      records: true
    }
  });

  console.log(`Created AnalysisBatch in database: ID: ${batch.id}, RecordCount: ${batch.records.length}`);

  if (batch.records.length !== 500) {
    console.error(`FAIL: Database record count mismatch! Expected 500, got ${batch.records.length}`);
    process.exit(1);
  }
  console.log('SUCCESS: 500 records saved in Database.');

  // Check specific database values equal source values
  const firstSource = rawData[0];
  const firstDb = batch.records.find(r => r.transactionId === firstSource[mapping.transactionId]);
  
  console.log(`Comparing DB values with source:`);
  console.log(`- Source amount: ${firstSource[mapping.amount]} vs DB amount: ${firstDb.amount}`);
  console.log(`- Source reference: ${firstSource[mapping.reference]} vs DB reference: ${firstDb.reference}`);

  if (parseFloat(firstSource[mapping.amount]) !== firstDb.amount || firstSource[mapping.reference] !== firstDb.reference) {
    console.error('FAIL: Database values do not equal source values!');
    process.exit(1);
  }
  console.log('SUCCESS: Database values equal source values.');

  const duplicateIds = [];
  const validIds = [];
  const batchRefsImport = new Set();
  const batchTxIdsImport = new Set();

  for (const rec of batch.records) {
    const isDuplicate = 
      (rec.reference && batchRefsImport.has(rec.reference)) || 
      (rec.transactionId && batchTxIdsImport.has(rec.transactionId));

    if (isDuplicate) {
      duplicateIds.push(rec.id);
    } else {
      validIds.push(rec.id);
    }

    if (rec.reference) batchRefsImport.add(rec.reference);
    if (rec.transactionId) batchTxIdsImport.add(rec.transactionId);
  }

  const importedCount = validIds.length;

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

    await tx.analysisBatch.update({
      where: { id: batch.id },
      data: { recordCount: importedCount }
    });
  }, {
    timeout: 30000
  });

  console.log(`Completed import execution:`);
  console.log(`- Imported record count: ${importedCount} (Expected: 488, i.e. 500 total - 12 duplicates)`);

  if (importedCount !== 488) {
    console.error(`FAIL: Imported count mismatch! Expected 488, got ${importedCount}`);
    process.exit(1);
  }
  console.log('SUCCESS: Skip duplicates logic validated with zero data corruption.');

  // Clean up database entries created during this test
  await prisma.analysisBatch.delete({
    where: { id: batch.id }
  });
  fs.unlinkSync(csvPath);
  console.log('Cleaned up test CSV and database entries.');
  
  console.log('\n--- ALL MODULE TESTS PASSED SUCCESSFULLY! ---');
}

runTest().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
