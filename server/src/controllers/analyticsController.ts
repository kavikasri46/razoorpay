import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;

    // Fetch sums
    const transactions = await prisma.transaction.findMany({
      where: { userId, status: { not: 'FAILED' } },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        if (tx.transactionDate >= startOfMonth) {
          monthlyIncome += tx.amount;
        }
      } else {
        totalExpense += tx.amount;
        if (tx.transactionDate >= startOfMonth) {
          monthlyExpense += tx.amount;
        }
      }
    });

    const totalBalance = totalIncome - totalExpense;
    const monthlySavings = monthlyIncome - monthlyExpense;

    // Fetch budget stats
    const budgets = await prisma.budget.findMany({ where: { userId } });
    let healthyBudgets = 0;
    let warningBudgets = 0;
    let exceededBudgets = 0;

    budgets.forEach((b) => {
      const ratio = b.spent / b.amount;
      if (ratio > 1.0) exceededBudgets++;
      else if (ratio >= 0.7) warningBudgets++;
      else healthyBudgets++;
    });

    // Fetch suspicious transaction count
    const flaggedCount = await prisma.transaction.count({
      where: { userId, status: 'FLAGGED' },
    });

    // Recurring payment total
    const recurring = await prisma.recurringPayment.findMany({
      where: { userId, status: 'ACTIVE' },
    });
    const totalRecurringMonthly = recurring.reduce((sum, item) => {
      // Standardize to monthly rate
      let amt = item.amount;
      if (item.frequency === 'DAILY') amt *= 30;
      else if (item.frequency === 'WEEKLY') amt *= 4.33;
      else if (item.frequency === 'YEARLY') amt /= 12;
      return sum + amt;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalBalance,
        totalIncome,
        totalExpense,
        monthlySavings,
        budgets: {
          total: budgets.length,
          healthy: healthyBudgets,
          warning: warningBudgets,
          exceeded: exceededBudgets,
        },
        flaggedTransactionsCount: flaggedCount,
        recurringMonthlyTotal: totalRecurringMonthly,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;

    // Fetch transactions from the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: { not: 'FAILED' },
        transactionDate: { gte: sixMonthsAgo },
      },
      orderBy: { transactionDate: 'asc' },
    });

    // Group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap: { [key: string]: { month: string; income: number; expense: number } } = {};

    // Initialize 6 months in map
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      trendMap[key] = {
        month: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        income: 0,
        expense: 0,
      };
    }

    transactions.forEach((tx) => {
      const txDate = new Date(tx.transactionDate);
      const key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
      if (trendMap[key]) {
        if (tx.type === 'INCOME') {
          trendMap[key].income += tx.amount;
        } else {
          trendMap[key].expense += tx.amount;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        trend: Object.values(trendMap),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategorySpending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        status: { not: 'FAILED' },
        transactionDate: { gte: startOfMonth },
      },
    });

    const categoryMap: { [category: string]: number } = {};
    expenses.forEach((tx) => {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
    });

    const categories = Object.keys(categoryMap).map((name) => ({
      name,
      value: categoryMap[name],
    }));

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentMethodDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;

    const transactions = await prisma.transaction.findMany({
      where: { userId, status: { not: 'FAILED' } },
    });

    const methodMap: { [method: string]: { count: number; volume: number } } = {};
    transactions.forEach((tx) => {
      if (!methodMap[tx.paymentMethod]) {
        methodMap[tx.paymentMethod] = { count: 0, volume: 0 };
      }
      methodMap[tx.paymentMethod].count += 1;
      methodMap[tx.paymentMethod].volume += tx.amount;
    });

    const distribution = Object.keys(methodMap).map((method) => ({
      method,
      count: methodMap[method].count,
      volume: methodMap[method].volume,
    }));

    res.status(200).json({
      success: true,
      data: { distribution },
    });
  } catch (error) {
    next(error);
  }
}
