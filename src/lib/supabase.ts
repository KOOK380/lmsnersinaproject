import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://kesaqpisyoljqacpnezk.supabase.co"; // Replace with your actual Supabase project URL if different
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_CspXSblxzuHNO1zJfhTdpA_6NaPbXLG"; // Using provided publishable key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
