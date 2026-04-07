/**
 * Hook de autenticacion que abstrae las operaciones de Supabase Auth.
 * Los componentes no acceden directamente a supabase.auth; lo hacen a traves de este hook.
 */
import { useState } from 'react';
import { supabase } from '@/services/supabase';

interface AuthActions {
  signIn:  (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  loading: boolean;
}

/**
 * @returns Acciones de autenticacion y estado de carga local de la operacion.
 *          El estado del usuario se obtiene de useAuthContext, no de este hook.
 */
export function useAuth(): AuthActions {
  const [loading, setLoading] = useState(false);

  /**
   * Inicia sesion con email y contrasena.
   * @returns Mensaje de error localizado, o null si el login fue exitoso.
   */
  async function signIn(email: string, password: string): Promise<string | null> {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      // Traduccion de errores comunes de Supabase al espanol
      if (error.message.includes('Invalid login credentials')) {
        return 'Credenciales incorrectas. Verifica tu email y contrasena.';
      }
      if (error.message.includes('Email not confirmed')) {
        return 'Confirma tu email antes de acceder.';
      }
      return 'Error al iniciar sesion. Intentalo de nuevo.';
    }

    return null;
  }

  /** Cierra la sesion activa y limpia el estado del SDK */
  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  return { signIn, signOut, loading };
}
