export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'researcher' | 'data_contributor'
          wallet_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'researcher' | 'data_contributor'
          wallet_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'researcher' | 'data_contributor'
          wallet_address?: string | null
          created_at?: string
        }
      }
      medical_history: {
        Row: {
          id: string
          user_id: string
          age: number
          height: number
          weight: number
          uses_contraceptives: boolean
          contraceptive_type: string | null
          contraceptive_duration: string | null
          last_period_date: string | null
          regular_cycles: boolean
          has_been_pregnant: boolean
          hormonal_conditions: string[]
          chronic_conditions: string[]
          allergies: string[]
          current_medications: string[]
          smokes: 'yes' | 'no' | 'ex_smoker'
          alcohol_consumption: 'never' | 'occasional' | 'regular'
          physical_activity: 'sedentary' | 'moderate' | 'high'
          consent_signed: boolean
          consent_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age: number
          height: number
          weight: number
          uses_contraceptives: boolean
          contraceptive_type?: string | null
          contraceptive_duration?: string | null
          last_period_date?: string | null
          regular_cycles: boolean
          has_been_pregnant: boolean
          hormonal_conditions: string[]
          chronic_conditions: string[]
          allergies: string[]
          current_medications: string[]
          smokes: 'yes' | 'no' | 'ex_smoker'
          alcohol_consumption: 'never' | 'occasional' | 'regular'
          physical_activity: 'sedentary' | 'moderate' | 'high'
          consent_signed?: boolean
          consent_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number
          height?: number
          weight?: number
          uses_contraceptives?: boolean
          contraceptive_type?: string | null
          contraceptive_duration?: string | null
          last_period_date?: string | null
          regular_cycles?: boolean
          has_been_pregnant?: boolean
          hormonal_conditions?: string[]
          chronic_conditions?: string[]
          allergies?: string[]
          current_medications?: string[]
          smokes?: 'yes' | 'no' | 'ex_smoker'
          alcohol_consumption?: 'never' | 'occasional' | 'regular'
          physical_activity?: 'sedentary' | 'moderate' | 'high'
          consent_signed?: boolean
          consent_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blood_tests: {
        Row: {
          id: string
          user_id: string
          file_url: string
          file_hash: string
          blockchain_hash: string | null
          stellar_transaction_id: string | null
          lab_name: string | null
          test_date: string | null
          extracted_data: Json | null
          processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_url: string
          file_hash: string
          blockchain_hash?: string | null
          stellar_transaction_id?: string | null
          lab_name?: string | null
          test_date?: string | null
          extracted_data?: Json | null
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_url?: string
          file_hash?: string
          blockchain_hash?: string | null
          stellar_transaction_id?: string | null
          lab_name?: string | null
          test_date?: string | null
          extracted_data?: Json | null
          processed?: boolean
          created_at?: string
        }
      }
      researcher_credits: {
        Row: {
          id: string
          researcher_id: string
          biochain_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          researcher_id: string
          biochain_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          researcher_id?: string
          biochain_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          researcher_id: string
          query: string
          report_data: Json
          blood_tests_used: string[]
          cost_in_biochain: number
          created_at: string
        }
        Insert: {
          id?: string
          researcher_id: string
          query: string
          report_data: Json
          blood_tests_used: string[]
          cost_in_biochain?: number
          created_at?: string
        }
        Update: {
          id?: string
          researcher_id?: string
          query?: string
          report_data?: Json
          blood_tests_used?: string[]
          cost_in_biochain?: number
          created_at?: string
        }
      }
      user_earnings: {
        Row: {
          id: string
          user_id: string
          report_id: string
          amount_usdc: number
          transaction_hash: string | null
          stellar_transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          report_id: string
          amount_usdc: number
          transaction_hash?: string | null
          stellar_transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_id?: string
          amount_usdc?: number
          transaction_hash?: string | null
          stellar_transaction_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
