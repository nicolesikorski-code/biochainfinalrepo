import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Helper para obtener el usuario actual
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper para obtener el perfil completo del usuario
export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Helper para obtener la historia médica
export async function getMedicalHistory(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('medical_history')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

// Helper para obtener créditos del investigador
export async function getResearcherCredits(researcherId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('researcher_credits')
    .select('*')
    .eq('researcher_id', researcherId)
    .single();

  if (error) throw error;
  return data;
}

// Helper para obtener ganancias del usuario
export async function getUserEarnings(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_earnings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Helper para obtener el balance total en USDC
export async function getTotalUSDCBalance(userId: string): Promise<number> {
  const earnings = await getUserEarnings(userId);
  return earnings.reduce((total, earning) => total + Number(earning.amount_usdc), 0);
}
