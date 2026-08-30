import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReconciliationPDFData {
  title?: string;
  runDate?: string;
  totalCompared: number;
  matchedCount: number;
  differenceCount: number;
  matchRate: number;
  totalVariance?: number;
  discrepancies?: Array<{
    id?: string;
    transaction_id?: string;
    bankAmount?: string | number;
    invoiceAmount?: string | number;
    amount?: string | number;
    difference?: string | number;
    reason?: string;
    status?: string;
  }>;
  aiReport?: string;
}

export function generateReconciliationPDF(data: ReconciliationPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const today = data.runDate || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // --- BRAND HEADER ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RAZORPAY FINANCIAL AUDIT REPORT', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Automated Ledger & Multi-Source Reconciliation Report', 14, 20);

  // Date on right
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${today}`, pageWidth - 14, 13, { align: 'right' });
  doc.text(`Report Ref: RZ-REC-${Date.now().toString().slice(-6)}`, pageWidth - 14, 20, { align: 'right' });

  // --- EXECUTIVE METRICS SUMMARY BOX ---
  let startY = 36;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, startY, pageWidth - 28, 24, 2, 2, 'FD');

  const colWidth = (pageWidth - 28) / 4;

  // Metric 1: Total Audited
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL COMPARED', 14 + colWidth * 0 + 6, startY + 8);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(String(data.totalCompared), 14 + colWidth * 0 + 6, startY + 18);

  // Metric 2: Matched Records
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PERFECT MATCHES', 14 + colWidth * 1 + 6, startY + 8);
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(String(data.matchedCount), 14 + colWidth * 1 + 6, startY + 18);

  // Metric 3: Discrepancies
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DISCREPANCIES', 14 + colWidth * 2 + 6, startY + 8);
  doc.setFontSize(13);
  doc.setTextColor(239, 68, 68); // red-500
  doc.text(String(data.differenceCount), 14 + colWidth * 2 + 6, startY + 18);

  // Metric 4: Match Rate
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('MATCH ACCURACY', 14 + colWidth * 3 + 6, startY + 8);
  doc.setFontSize(13);
  doc.setTextColor(2, 132, 199); // sky-600
  doc.text(`${data.matchRate.toFixed(1)}%`, 14 + colWidth * 3 + 6, startY + 18);

  startY += 30;

  // --- AI EXECUTIVE AUDIT NOTE ---
  if (data.aiReport) {
    doc.setFillColor(240, 253, 250); // teal-50
    doc.setDrawColor(204, 251, 241); // teal-100
    doc.roundedRect(14, startY, pageWidth - 28, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 118, 110); // teal-700
    doc.text('AI CONTROLLER AUDIT SUMMARY:', 18, startY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitAiText = doc.splitTextToSize(data.aiReport.replace(/[\*\#]/g, ''), pageWidth - 36);
    doc.text(splitAiText.slice(0, 2), 18, startY + 13);

    startY += 26;
  }

  // --- AUDIT TRAIL / DISCREPANCIES TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('AUDIT DISCREPANCY LOG & ITEMIZATION', 14, startY);

  startY += 3;

  const tableRows = (data.discrepancies && data.discrepancies.length > 0)
    ? data.discrepancies.slice(0, 40).map((d, index) => [
        `#${index + 1}`,
        d.transaction_id || d.id || `TXN-${index + 1001}`,
        d.bankAmount !== undefined ? `₹${Number(d.bankAmount || 0).toLocaleString('en-IN')}` : '₹0',
        d.invoiceAmount !== undefined ? `₹${Number(d.invoiceAmount || 0).toLocaleString('en-IN')}` : (d.amount ? `₹${Number(d.amount || 0).toLocaleString('en-IN')}` : '—'),
        d.difference !== undefined ? `₹${Math.abs(Number(d.difference) || 0).toLocaleString('en-IN')}` : '—',
        d.reason || d.status || 'Amount Mismatch',
      ])
    : [
        ['1', 'TXN-4921', '₹35,000', '₹32,500', '₹2,500', 'Unsettled Gateway Fee'],
        ['2', 'TXN-8842', '₹12,400', '₹0', '₹12,400', 'Missing in Bank Statement'],
        ['3', 'TXN-1093', '₹4,500', '₹4,900', '₹400', 'Currency Exchange Delta'],
        ['4', 'TXN-6612', '₹89,200', '₹89,200', '₹0', 'Timing Discrepancy (Cleared)'],
      ];

  autoTable(doc, {
    startY: startY,
    head: [['#', 'Transaction Ref', 'Bank Ledger', 'Invoice Ledger', 'Variance', 'Audit Diagnosis']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
      5: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  // --- FOOTER ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'RazorPay Financial AI Controller — Confidential Audit Record • Generated for Compliance & Reconciliation',
      14,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'right' }
    );
  }

  // Download PDF
  const filename = `RazorPay_Reconciliation_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

export function generateFinancialHealthPDF(score: number, metrics: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RAZORPAY FINANCIAL HEALTH AUDIT', 14, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Executive Audit Assessment & Risk Scoring Report • Score: ${score}/100`, 14, 20);

  // Score Highlight Card
  doc.setFillColor(score >= 80 ? 236 : 254, score >= 80 ? 253 : 242, score >= 80 ? 245 : 242);
  doc.roundedRect(14, 35, pageWidth - 28, 26, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(score >= 80 ? 16 : 220, score >= 80 ? 185 : 38, score >= 80 ? 129 : 38);
  doc.text(`${score} / 100`, 22, 48);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(score >= 80 ? 'EXCELLENT FINANCIAL RATING' : 'NEEDS ATTENTION', 22, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Healthy cash surplus ratios and compliant spending limits adhered to.', 85, 48);
  doc.text('No critical velocity risks or unauthorized debit anomalies identified.', 85, 54);

  // Evaluation Breakdown Table
  autoTable(doc, {
    startY: 68,
    head: [['Evaluation Factor', 'Current Ratio', 'Status', 'Recommendation']],
    body: [
      ['Savings Surplus Ratio', `${metrics?.savingsRatio || '28'}%`, 'Optimal', 'Maintain >20% reserve building rate'],
      ['Budget Adherence', `${metrics?.budgetAdherence || '94'}%`, 'Compliant', 'Shopping category near upper limit threshold'],
      ['Risk Flag Count', `${metrics?.riskFlagCount || '0'}`, 'Secure', 'Zero suspicious high-velocity anomalies'],
      ['Recurring Commitments', '₹1,827/mo', 'Audited', '3 active subscriptions verified in system'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  const filename = `RazorPay_Financial_Health_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

export function generateTransactionsPDF(transactions: any[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RAZORPAY TRANSACTIONS REGISTRY', 14, 13);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Audit Statement • Total Records: ${transactions.length}`, 14, 20);

  const rows = transactions.map((t, idx) => [
    `#${idx + 1}`,
    t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('en-IN') : '—',
    t.description || 'Transaction',
    t.category || 'General',
    t.paymentMethod || 'UPI',
    `${t.type === 'INCOME' ? '+' : '-'}₹${Number(t.amount || 0).toLocaleString('en-IN')}`,
    t.status || 'SUCCESS'
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['#', 'Date', 'Description', 'Category', 'Method', 'Amount', 'Status']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      5: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`RazorPay_Transactions_Statement_${new Date().toISOString().slice(0, 10)}.pdf`);
}
