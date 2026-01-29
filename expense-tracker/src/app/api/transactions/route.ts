import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTransactionSchema, listTransactionsQuerySchema } from '@/lib/validations/transaction'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      from_date: searchParams.get('from_date') || undefined,
      to_date: searchParams.get('to_date') || undefined,
      type: searchParams.get('type') || undefined,
    }

    const validatedQuery = listTransactionsQuerySchema.safeParse(queryParams)
    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validatedQuery.error.flatten() },
        { status: 400 }
      )
    }

    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:categories(id, name, type)
      `)
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false })

    if (validatedQuery.data.from_date) {
      query = query.gte('occurred_at', validatedQuery.data.from_date)
    }
    if (validatedQuery.data.to_date) {
      query = query.lte('occurred_at', validatedQuery.data.to_date)
    }
    if (validatedQuery.data.type) {
      query = query.eq('type', validatedQuery.data.type)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({ data: transactions })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const validatedData = createTransactionSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const { type, amount, category_id, note, occurred_at } = validatedData.data

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, type')
      .eq('id', category_id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }

    if (category.type !== type) {
      return NextResponse.json(
        { error: `Category type '${category.type}' does not match transaction type '${type}'` },
        { status: 400 }
      )
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type,
        amount,
        category_id,
        note: note || null,
        occurred_at,
      })
      .select(`
        *,
        category:categories(id, name, type)
      `)
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    return NextResponse.json({ data: transaction }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
