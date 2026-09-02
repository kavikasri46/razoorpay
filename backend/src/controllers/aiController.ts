import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService';
import { prisma } from '../config/db';
import { logAudit } from '../utils/auditLogger';

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { message } = req.body;

    const reply = await aiService.generateChatResponse(userId, message);

    await logAudit({
      userId,
      action: 'AI_CHAT_REQUEST',
      entity: 'AI',
      metadata: { query: message.slice(0, 100) },
    });

    res.status(200).json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
}

export async function analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;

    const analysis = await aiService.analyzeSpending(userId);

    await logAudit({
      userId,
      action: 'AI_SPENDING_ANALYZE',
      entity: 'AI',
    });

    res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
}

export async function getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;

    // Fetch existing AI insights from the database
    const insights = await prisma.aIInsight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { insights },
    });
  } catch (error) {
    next(error);
  }
}

export async function analyzeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No image uploaded' });
      return;
    }

    const analysis = await aiService.analyzeUploadedImage(userId, file);

    await logAudit({
      userId,
      action: 'AI_IMAGE_ANALYZE',
      entity: 'AI',
    });

    res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
}
