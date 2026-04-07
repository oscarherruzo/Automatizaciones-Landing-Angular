/**
 * Instancia unica del cliente Supabase.
 * Las claves son publicas (anon key) y seguras para el cliente.
 * El JWT de sesion lo gestiona el SDK internamente; nunca se expone en estado global.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables de entorno de Supabase no configuradas. Revisa .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession:   true,
    autoRefreshToken: true,
  },
});
