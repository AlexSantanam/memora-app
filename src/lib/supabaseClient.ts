import { createClient } from "@supabase/supabase-js";

// Antes de migrar a Supabase (commit 44d77cf), la app guardaba memoriales
// completos —incluidas fotos en base64— directo en localStorage bajo estas
// claves. El código actual no las lee ni las escribe más, pero nunca se
// limpiaron: en cualquier navegador que haya usado la app antes de esa
// migración, siguen ahí ocupando varios MB. Si localStorage llega a su cupo
// (~5-10MB por origen), CUALQUIER escritura nueva falla en silencio —
// incluida la del propio SDK de Supabase Auth al guardar la sesión, lo que
// deja la sesión "viva" solo en memoria de React pero sin persistir de
// verdad. Se limpia acá, antes de crear el cliente, para no competir por
// cupo con la sesión real.
try {
  ["memora_app_memorials_v1", "memora_app_user_v1", "memora_registered_accounts_v1"].forEach((key) =>
    localStorage.removeItem(key)
  );
} catch {
  // localStorage inaccesible (SSR, modo privado estricto, etc.) — nada que limpiar.
}

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️  VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY no configurados — la autenticación y base de datos no funcionarán.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
