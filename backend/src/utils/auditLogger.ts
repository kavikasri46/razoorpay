import { prisma } from '../config/db';

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  metadata,
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
