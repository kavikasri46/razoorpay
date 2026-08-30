import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const totalUsers = await prisma.user.count();
    
    // Active users: Users who have made at least one transaction
    const activeUsers = await prisma.user.count({
      where: {
        transactions: {
          some: {},
        },
      },
    });

    const totalTransactions = await prisma.transaction.count();
    
    const txVolumeAggregation = await prisma.transaction.aggregate({
      where: { status: { not: 'FAILED' } },
      _sum: { amount: true },
    });
    const totalVolume = txVolumeAggregation._sum.amount || 0;

    const flaggedTransactions = await prisma.transaction.count({
      where: { status: 'FLAGGED' },
    });

    // Count AI requests from audit logs
    const aiRequests = await prisma.auditLog.count({
      where: {
        action: {
          in: ['AI_CHAT_REQUEST', 'AI_SPENDING_ANALYZE'],
        },
      },
    });

    // Return system stats
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalTransactions,
          totalVolume,
          flaggedTransactions,
          aiRequests,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllTransactions(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
      take: 100, // Cap to top 100 for admin review
    });

    res.status(200).json({
      success: true,
      data: { transactions },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 items
    });

    res.status(200).json({
      success: true,
      data: { auditLogs },
    });
  } catch (error) {
    next(error);
  }
}
