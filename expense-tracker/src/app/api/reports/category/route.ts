import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get('from_date')
    const toDate = searchParams.get('to_date')
    const type = searchParams.get('type')

    let query = supabase
      .from('transactions')
      .select(`
        amount,
        type,
        category:categories(id, name, type)
      `)
      .eq('user_id', user.id)

    if (fromDate) {
      query = query.gte('occurred_at', fromDate)
    }
    if (toDate) {
      query = query.lte('occurred_at', toDate)
    }
    if (type && (type === 'income' || type === 'expense')) {
      query = query.eq('type', type)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching transactions for report:', error)
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }

    const categoryTotals = new Map<string, { 
      category_id: string
      category_name: string
      category_type: string
      total_amount: number 
    }>()

    for (const transaction of transactions || []) {
      const category = transaction.category as { id: string; name: string; type: string } | null
      if (!category) continue

      const existing = categoryTotals.get(category.id)
      if (existing) {
        existing.total_amount += transaction.amount
      } else {
        categoryTotals.set(category.id, {
          category_id: category.id,
          category_name: category.name,
          category_type: category.type,
          total_amount: transaction.amount,
        })
      }
    }

    const summary = Array.from(categoryTotals.values()).sort(
      (a, b) => b.total_amount - a.total_amount
    )

    const totalIncome = summary
      .filter(s => s.category_type === 'income')
      .reduce((sum, s) => sum + s.total_amount, 0)

    const totalExpense = summary
      .filter(s => s.category_type === 'expense')
      .reduce((sum, s) => sum + s.total_amount, 0)

    return NextResponse.json({
      data: {
        by_category: summary,
        totals: {
          income: totalIncome,
          expense: totalExpense,
          balance: totalIncome - totalExpense,
        },
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
