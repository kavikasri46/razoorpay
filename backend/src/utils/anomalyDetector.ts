import { prisma } from '../config/db';

export interface AnomalyResult {
  status: 'SUCCESS' | 'FLAGGED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
}

export async function detectAnomaly(
  userId: string,
  amount: number,
  category: string,
  type: string
): Promise<AnomalyResult> {
  const reasons: string[] = [];
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let status: 'SUCCESS' | 'FLAGGED' = 'SUCCESS';

  if (type === 'INCOME') {
    return { status: 'SUCCESS', riskLevel: 'LOW', reasons: [] };
  }

  // Heuristic 1: Outsized amount thresholds
  if (amount >= 30000) {
    status = 'FLAGGED';
    riskLevel = 'HIGH';
    reasons.push(`Unusually high transaction amount of ₹${amount.toLocaleString('en-IN')} detected.`);
  } else if (amount >= 15000) {
    riskLevel = 'MEDIUM';
    reasons.push(`Relatively high amount of ₹${amount.toLocaleString('en-IN')} for single transaction.`);
  }

  // Heuristic 2: Rapid transaction velocity (repeated transactions)
  // Retrieve transactions for this user within the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const recentTransactionsCount = await prisma.transaction.count({
      where: {
        userId,
        transactionDate: {
          gte: fiveMinutesAgo,
        },
      },
    });

    if (recentTransactionsCount >= 3) {
      status = 'FLAGGED';
      riskLevel = 'HIGH';
      reasons.push(`Velocity warning: ${recentTransactionsCount + 1} transactions requested in less than 5 minutes.`);
    }
  } catch (err) {
    console.error('Error checking transaction velocity:', err);
  }

  // Heuristic 3: Category specific warning limits
  if (category === 'Food' && amount > 5000) {
    if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
    reasons.push(`Food delivery expense of ₹${amount} exceeds standard thresholds.`);
  }

  return { status, riskLevel, reasons };
}
