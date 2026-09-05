import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Missing Supabase environment variables. Please check your .env file.');
    console.error('📝 Follow the instructions in SUPABASE_SETUP.md to configure Supabase.');
    supabase = null;
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
