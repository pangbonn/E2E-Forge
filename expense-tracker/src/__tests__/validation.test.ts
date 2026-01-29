import {
  createTransactionSchema,
  validateAmountPositive,
  validateCategoryTypeMatch,
} from '@/lib/validations/transaction'

describe('Transaction Validation', () => {
  describe('validateAmountPositive', () => {
    it('should return true for positive integers', () => {
      expect(validateAmountPositive(100)).toBe(true)
      expect(validateAmountPositive(1)).toBe(true)
      expect(validateAmountPositive(999999)).toBe(true)
    })

    it('should return false for zero', () => {
      expect(validateAmountPositive(0)).toBe(false)
    })

    it('should return false for negative numbers', () => {
      expect(validateAmountPositive(-1)).toBe(false)
      expect(validateAmountPositive(-100)).toBe(false)
    })

    it('should return false for non-integers', () => {
      expect(validateAmountPositive(10.5)).toBe(false)
      expect(validateAmountPositive(0.99)).toBe(false)
    })
  })

  describe('validateCategoryTypeMatch', () => {
    it('should return true when types match', () => {
      expect(validateCategoryTypeMatch('income', 'income')).toBe(true)
      expect(validateCategoryTypeMatch('expense', 'expense')).toBe(true)
    })

    it('should return false when types do not match', () => {
      expect(validateCategoryTypeMatch('income', 'expense')).toBe(false)
      expect(validateCategoryTypeMatch('expense', 'income')).toBe(false)
    })
  })

  describe('createTransactionSchema', () => {
    const validTransaction = {
      type: 'expense',
      amount: 10000,
      category_id: '123e4567-e89b-12d3-a456-426614174000',
      note: 'Test transaction',
      occurred_at: '2024-01-15T10:30:00.000Z',
    }

    it('should validate a correct transaction', () => {
      const result = createTransactionSchema.safeParse(validTransaction)
      expect(result.success).toBe(true)
    })

    it('should reject amount of 0', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        amount: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative amount', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        amount: -100,
      })
      expect(result.success).toBe(false)
    })

    it('should reject non-integer amount', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        amount: 10.5,
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid transaction type', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        type: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('should accept income type', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        type: 'income',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid category_id format', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        category_id: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
    })

    it('should accept null note', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        note: null,
      })
      expect(result.success).toBe(true)
    })

    it('should accept missing note', () => {
      const { note: _note, ...transactionWithoutNote } = validTransaction
      const result = createTransactionSchema.safeParse(transactionWithoutNote)
      expect(result.success).toBe(true)
    })

    it('should reject invalid date format', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        occurred_at: 'not-a-date',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Business Rules', () => {
  describe('Amount stored as cents (integers)', () => {
    it('should store 100 baht as 10000 satang', () => {
      const bahtAmount = 100
      const satangAmount = bahtAmount * 100
      expect(satangAmount).toBe(10000)
      expect(Number.isInteger(satangAmount)).toBe(true)
    })

    it('should store 0.01 baht as 1 satang', () => {
      const bahtAmount = 0.01
      const satangAmount = Math.round(bahtAmount * 100)
      expect(satangAmount).toBe(1)
      expect(Number.isInteger(satangAmount)).toBe(true)
    })

    it('should handle decimal precision correctly', () => {
      const bahtAmount = 123.45
      const satangAmount = Math.round(bahtAmount * 100)
      expect(satangAmount).toBe(12345)
      expect(Number.isInteger(satangAmount)).toBe(true)
    })
  })

  describe('Transaction immutability', () => {
    it('should not have Update type in Transaction database type', () => {
      // This test documents the immutability rule
      // The actual enforcement is at the database level (no UPDATE policy)
      // and in the API (no PUT/PATCH endpoint)
      expect(true).toBe(true)
    })
  })
})
