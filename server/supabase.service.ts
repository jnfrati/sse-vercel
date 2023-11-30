import { SupabaseClient, createClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

const supabaseKey = process.env.SUPABASE_ANON_PUBLIC || ""
if (!supabase) {
  supabase = createClient('https://tyemkqfkcwvjrnkkzgum.supabase.co', supabaseKey)
}

export default supabase


