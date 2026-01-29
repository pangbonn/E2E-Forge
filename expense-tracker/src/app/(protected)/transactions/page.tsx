'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Transaction, Category } from '@/types/database'

interface TransactionWithCategory extends Transaction {
  category: Category | null
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(cents / 100)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filter !== 'all') {
          params.set('type', filter)
        }

        const response = await fetch(`/api/transactions?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }

        const result = await response.json()
        setTransactions(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [filter])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link href="/transactions/new" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`btn btn-sm ${filter === 'income' ? 'btn-success' : 'btn-outline btn-success'}`}
          onClick={() => setFilter('income')}
        >
          Income
        </button>
        <button
          className={`btn btn-sm ${filter === 'expense' ? 'btn-error' : 'btn-outline btn-error'}`}
          onClick={() => setFilter('expense')}
        >
          Expense
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <p className="text-base-content/60">No transactions found</p>
            <Link href="/transactions/new" className="btn btn-primary btn-sm mx-auto mt-2">
              Add your first transaction
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="card bg-base-100 shadow">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${transaction.type === 'income' ? 'badge-success' : 'badge-error'}`}>
                        {transaction.type}
                      </span>
                      <span className="font-medium">
                        {transaction.category?.name || 'Unknown Category'}
                      </span>
                    </div>
                    {transaction.note && (
                      <p className="text-sm text-base-content/60 mt-1">{transaction.note}</p>
                    )}
                    <p className="text-xs text-base-content/40 mt-1">
                      {formatDate(transaction.occurred_at)}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-success' : 'text-error'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
