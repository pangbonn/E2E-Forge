'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface CategorySummary {
  category_id: string
  category_name: string
  category_type: string
  total_amount: number
}

interface ReportData {
  by_category: CategorySummary[]
  totals: {
    income: number
    expense: number
    balance: number
  }
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(cents / 100)
}

export default function DashboardPage() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const response = await fetch('/api/reports/category', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }

      const result = await response.json()
      setReport(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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

  const incomeCategories = report?.by_category.filter(c => c.category_type === 'income') || []
  const expenseCategories = report?.by_category.filter(c => c.category_type === 'expense') || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/transactions/new" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Link>
      </div>

      <div className="stats stats-vertical sm:stats-horizontal shadow w-full bg-base-100">
        <div className="stat">
          <div className="stat-title">Total Income</div>
          <div className="stat-value text-success text-xl sm:text-2xl">
            {formatCurrency(report?.totals.income || 0)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Expense</div>
          <div className="stat-value text-error text-xl sm:text-2xl">
            {formatCurrency(report?.totals.expense || 0)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Balance</div>
          <div className={`stat-value text-xl sm:text-2xl ${(report?.totals.balance || 0) >= 0 ? 'text-success' : 'text-error'}`}>
            {formatCurrency(report?.totals.balance || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              Income by Category
            </h2>
            {incomeCategories.length === 0 ? (
              <p className="text-base-content/60">No income recorded yet</p>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map((cat) => (
                  <div key={cat.category_id} className="flex justify-between items-center">
                    <span>{cat.category_name}</span>
                    <span className="font-semibold text-success">
                      {formatCurrency(cat.total_amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
              Expenses by Category
            </h2>
            {expenseCategories.length === 0 ? (
              <p className="text-base-content/60">No expenses recorded yet</p>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((cat) => (
                  <div key={cat.category_id} className="flex justify-between items-center">
                    <span>{cat.category_name}</span>
                    <span className="font-semibold text-error">
                      {formatCurrency(cat.total_amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/transactions" className="btn btn-outline btn-sm">
              View All Transactions
            </Link>
            <Link href="/transactions/new?type=income" className="btn btn-success btn-outline btn-sm">
              Add Income
            </Link>
            <Link href="/transactions/new?type=expense" className="btn btn-error btn-outline btn-sm">
              Add Expense
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
