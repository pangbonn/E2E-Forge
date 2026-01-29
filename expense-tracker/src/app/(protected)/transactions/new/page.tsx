'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Category, TransactionType } from '@/types/database'

export default function NewTransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') as TransactionType | null

  const [type, setType] = useState<TransactionType>(initialType || 'expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await fetch(`/api/categories?type=${type}`)
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const result = await response.json()
        setCategories(result.data || [])
        setCategoryId('')
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const amountInCents = Math.round(parseFloat(amount) * 100)

    if (isNaN(amountInCents) || amountInCents <= 0) {
      setError('Amount must be a positive number')
      setLoading(false)
      return
    }

    if (!categoryId) {
      setError('Please select a category')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          amount: amountInCents,
          category_id: categoryId,
          note: note || null,
          occurred_at: new Date(occurredAt).toISOString(),
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to create transaction')
      }

      router.push('/transactions')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/transactions" className="btn btn-ghost btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">New Transaction</h1>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Type</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn flex-1 ${type === 'income' ? 'btn-success' : 'btn-outline btn-success'}`}
                  onClick={() => setType('income')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  Income
                </button>
                <button
                  type="button"
                  className={`btn flex-1 ${type === 'expense' ? 'btn-error' : 'btn-outline btn-error'}`}
                  onClick={() => setType('expense')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                  Expense
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Amount (THB)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="input input-bordered w-full text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <label className="label">
                <span className="label-text-alt">Enter amount in Baht (will be stored as Satang)</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              {loadingCategories ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Loading categories...</span>
                </div>
              ) : (
                <select
                  className="select select-bordered w-full"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Date & Time</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Note (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Link href="/transactions" className="btn btn-ghost flex-1">
                Cancel
              </Link>
              <button
                type="submit"
                className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
                disabled={loading || loadingCategories}
              >
                {loading ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
