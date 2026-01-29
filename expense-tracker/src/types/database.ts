export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TransactionType = 'income' | 'expense'

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          type: TransactionType
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: TransactionType
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: TransactionType
          created_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: TransactionType
          amount: number
          category_id: string
          note: string | null
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: TransactionType
          amount: number
          category_id: string
          note?: string | null
          occurred_at: string
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          table_name?: string
          record_id?: string
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      transaction_type: TransactionType
      user_role: 'user' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Category = Tables<'categories'>
export type Transaction = Tables<'transactions'>
export type AuditLog = Tables<'audit_logs'>
export type Profile = Tables<'profiles'>
