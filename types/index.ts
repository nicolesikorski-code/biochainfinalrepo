export type UserRole = 'researcher' | 'data_contributor';

export type SmokeStatus = 'yes' | 'no' | 'ex_smoker';
export type AlcoholConsumption = 'never' | 'occasional' | 'regular';
export type PhysicalActivity = 'sedentary' | 'moderate' | 'high';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  wallet_address: string;
  wallet_private_key?: string; // Stellar private key (in production, should be encrypted)
  created_at: string;
}

export interface MedicalHistory {
  id: string;
  user_id: string;
  age: number;
  height: number;
  weight: number;
  uses_contraceptives: boolean;
  contraceptive_type?: string;
  contraceptive_duration?: string;
  last_period_date?: string;
  regular_cycles: boolean;
  has_been_pregnant: boolean;
  hormonal_conditions: string[];
  chronic_conditions: string[];
  allergies: string[];
  current_medications: string[];
  smokes: SmokeStatus;
  alcohol_consumption: AlcoholConsumption;
  physical_activity: PhysicalActivity;
  consent_signed: boolean;
  consent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BloodTest {
  id: string;
  user_id: string;
  file_url: string;
  file_hash: string;
  blockchain_hash?: string;
  stellar_transaction_id?: string;
  lab_name?: string;
  test_date?: string;
  extracted_data?: {
    lab_name: string;
    test_date: string;
    hormones: {
      progesterone?: string;
      estrogen?: string;
      testosterone?: string;
      fsh?: string;
      lh?: string;
    };
    patient_data_removed: boolean;
    processed_with_cvm: boolean;
  };
  processed: boolean;
  created_at: string;
}

export interface ResearcherCredits {
  id: string;
  researcher_id: string;
  biochain_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  researcher_id: string;
  query: string;
  report_data: {
    query: string;
    generated_at: string;
    total_samples: number;
    demographics: {
      age_range: string;
      average_age: string;
      contraceptive_users: number;
      non_contraceptive_users: number;
    };
    hormonal_data: {
      progesterone_avg: string;
      estrogen_avg: string;
      testosterone_avg: string;
    };
    medical_context: Array<{
      age: number;
      contraceptive: string;
      duration: string;
      conditions: string[];
    }>;
  };
  blood_tests_used: string[];
  cost_in_biochain: number;
  created_at: string;
}

export interface UserEarning {
  id: string;
  user_id: string;
  report_id: string;
  amount_usdc: number;
  transaction_hash?: string;
  stellar_transaction_id?: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
