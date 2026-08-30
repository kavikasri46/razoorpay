import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorMiddleware';
import { detectAnomaly } from '../utils/anomalyDetector';
import { logAudit } from '../utils/auditLogger';

// Retrieve all transactions with filtering, searching, sorting, pagination
export async function getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const {
      page = 1,
      limit = 10,
      search,
      category,
      type,
      status,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'transactionDate',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query conditions
    const where: any = { userId };

    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category as string;
    }

    if (type) {
      where.type = type as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod as string;
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.transactionDate.lte = new Date(endDate as string);
      }
    }

    // Execute queries
    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// Retrieve single transaction details
export async function getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
}

// Create a new transaction (with budget spent and anomaly checks)
export async function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { amount, type, category, description, paymentMethod, transactionDate } = req.body;

    // 1. Run Anomaly Detection
    const anomaly = await detectAnomaly(userId, amount, category, type);

    // 2. Create Transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        category,
        description,
        paymentMethod,
        status: anomaly.status,
        riskLevel: anomaly.riskLevel,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      },
    });

    // 3. Update budget tracking if it is an Expense
    if (type === 'EXPENSE') {
      const budget = await prisma.budget.findUnique({
        where: { userId_category: { userId, category } },
      });

      if (budget) {
        const newSpent = budget.spent + amount;
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: newSpent },
        });

        // Trigger budget warnings
        const utilization = newSpent / budget.amount;
        if (utilization > 1.0) {
          await prisma.notification.create({
            data: {
              userId,
              title: `Budget Limit Exceeded: ${category}`,
              message: `You spent ₹${newSpent.toLocaleString('en-IN')} of your ₹${budget.amount.toLocaleString('en-IN')} ${category} limit.`,
              type: 'BUDGET_WARNING',
            },
          });
        } else if (utilization >= 0.9) {
          await prisma.notification.create({
            data: {
              userId,
              title: `Budget Danger: ${category}`,
              message: `You used ${Math.round(utilization * 100)}% of your ₹${budget.amount.toLocaleString('en-IN')} ${category} limit.`,
              type: 'BUDGET_WARNING',
            },
          });
        } else if (utilization >= 0.7) {
          await prisma.notification.create({
            data: {
              userId,
              title: `Budget Warning: ${category}`,
              message: `You used ${Math.round(utilization * 100)}% of your ₹${budget.amount.toLocaleString('en-IN')} ${category} limit.`,
              type: 'BUDGET_WARNING',
            },
          });
        }
      }
    }

    // 4. Trigger alert notification for suspicious/flagged transactions
    if (anomaly.status === 'FLAGGED') {
      await prisma.notification.create({
        data: {
          userId,
          title: 'Suspicious Transaction Flagged',
          message: `A charge of ₹${amount.toLocaleString('en-IN')} at ${description} was flagged due to: ${anomaly.reasons.join(', ')}`,
          type: 'SUSPICIOUS_TX',
        },
      });
    }

    // 5. Audit Log
    await logAudit({
      userId,
      action: 'TRANSACTION_CREATE',
      entity: 'TRANSACTION',
      entityId: transaction.id,
      metadata: { amount, type, category, description, riskLevel: anomaly.riskLevel },
    });

    res.status(201).json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
}

// Update an existing transaction (re-calculate budget spent if amount changes)
export async function updateTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { amount, type, category, description, paymentMethod, status, transactionDate } = req.body;

    const oldTx = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!oldTx) {
      throw new AppError('Transaction not found', 404);
    }

    // Recheck anomalies if amount changes
    let updatedStatus = status || oldTx.status;
    let updatedRiskLevel = oldTx.riskLevel;
    if (amount !== undefined && amount !== oldTx.amount) {
      const anomaly = await detectAnomaly(userId, amount, category || oldTx.category, type || oldTx.type);
      updatedStatus = anomaly.status;
      updatedRiskLevel = anomaly.riskLevel;
    }

    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? amount : oldTx.amount,
        type: type || oldTx.type,
        category: category || oldTx.category,
        description: description || oldTx.description,
        paymentMethod: paymentMethod || oldTx.paymentMethod,
        status: updatedStatus,
        riskLevel: updatedRiskLevel,
        transactionDate: transactionDate ? new Date(transactionDate) : oldTx.transactionDate,
      },
    });

    // Budget adjustments
    // If budget needs adjusting (type was or is expense)
    if (oldTx.type === 'EXPENSE') {
      const budget = await prisma.budget.findUnique({
        where: { userId_category: { userId, category: oldTx.category } },
      });
      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: Math.max(0, budget.spent - oldTx.amount) },
        });
      }
    }

    if (updatedTx.type === 'EXPENSE') {
      const budget = await prisma.budget.findUnique({
        where: { userId_category: { userId, category: updatedTx.category } },
      });
      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: budget.spent + updatedTx.amount },
        });
      }
    }

    await logAudit({
      userId,
      action: 'TRANSACTION_UPDATE',
      entity: 'TRANSACTION',
      entityId: id,
      metadata: { before: { amount: oldTx.amount }, after: { amount: updatedTx.amount } },
    });

    res.status(200).json({
      success: true,
      data: { transaction: updatedTx },
    });
  } catch (error) {
    next(error);
  }
}

// Delete a transaction (decrease budget spent)
export async function deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    await prisma.transaction.delete({
      where: { id },
    });

    // Decrement budget spent
    if (transaction.type === 'EXPENSE') {
      const budget = await prisma.budget.findUnique({
        where: { userId_category: { userId, category: transaction.category } },
      });
      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: Math.max(0, budget.spent - transaction.amount) },
        });
      }
    }

    await logAudit({
      userId,
      action: 'TRANSACTION_DELETE',
      entity: 'TRANSACTION',
      entityId: id,
      metadata: { deleted: transaction },
    });

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
