import { z } from 'zod'

export const transactionTypeSchema = z.enum(['income', 'expense'])

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z.number().int().positive('Amount must be a positive integer (in cents)'),
  category_id: z.string().uuid('Invalid category ID'),
  note: z.string().max(500).optional().nullable(),
  occurred_at: z.string().datetime('Invalid date format'),
})

export const listTransactionsQuerySchema = z.object({
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
  type: transactionTypeSchema.optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>

export function validateAmountPositive(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0
}

export function validateCategoryTypeMatch(
  transactionType: 'income' | 'expense',
  categoryType: 'income' | 'expense'
): boolean {
  return transactionType === categoryType
}
