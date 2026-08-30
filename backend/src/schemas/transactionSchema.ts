import { z } from 'zod';

export const transactionCreateSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  paymentMethod: z.enum(['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'WALLET']),
  status: z.enum(['SUCCESS', 'PENDING', 'FAILED', 'FLAGGED']).optional().default('SUCCESS'),
  transactionDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional().or(z.date().optional()),
});

export const transactionUpdateSchema = transactionCreateSchema.partial();

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
