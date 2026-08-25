import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorMiddleware';
import { logAudit } from '../utils/auditLogger';

export async function getBudgets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;

    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { category: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: { budgets },
    });
  } catch (error) {
    next(error);
  }
}

export async function createBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { category, amount, period = 'MONTHLY' } = req.body;

    const existingBudget = await prisma.budget.findUnique({
      where: { userId_category: { userId, category } },
    });

    if (existingBudget) {
      throw new AppError(`A budget for category "${category}" already exists`, 409);
    }

    // Smart spent aggregation: Calculate already spent in current calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenseAggregation = await prisma.transaction.aggregate({
      where: {
        userId,
        category,
        type: 'EXPENSE',
        status: { not: 'FAILED' },
        transactionDate: { gte: startOfMonth },
      },
      _sum: {
        amount: true,
      },
    });

    const currentSpent = expenseAggregation._sum.amount || 0;

    const budget = await prisma.budget.create({
      data: {
        userId,
        category,
        amount,
        spent: currentSpent,
        period,
      },
    });

    await logAudit({
      userId,
      action: 'BUDGET_CREATE',
      entity: 'BUDGET',
      entityId: budget.id,
      metadata: { category, amount },
    });

    res.status(201).json({
      success: true,
      data: { budget },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { amount } = req.body;

    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: { amount },
    });

    await logAudit({
      userId,
      action: 'BUDGET_UPDATE',
      entity: 'BUDGET',
      entityId: id,
      metadata: { oldLimit: budget.amount, newLimit: amount },
    });

    res.status(200).json({
      success: true,
      data: { budget: updatedBudget },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new AppError('Budget not found', 404);
    }

    await prisma.budget.delete({
      where: { id },
    });

    await logAudit({
      userId,
      action: 'BUDGET_DELETE',
      entity: 'BUDGET',
      entityId: id,
      metadata: { deletedBudget: budget },
    });

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
