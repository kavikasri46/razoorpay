import { z } from 'zod';

export const budgetCreateSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Budget limit must be greater than 0'),
  period: z.string().optional().default('MONTHLY'),
});

export const budgetUpdateSchema = z.object({
  amount: z.number().positive('Budget limit must be greater than 0'),
});

export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;
export type BudgetUpdateInput = z.infer<typeof budgetUpdateSchema>;
