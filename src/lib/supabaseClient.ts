import { createClient } from "@supabase/supabase-js";

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️  VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY no configurados — la autenticación y base de datos no funcionarán.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
