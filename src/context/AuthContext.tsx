/**
 * AuthContext — estado global de autenticacion.
 *
 * Expone unicamente { user, loading }.
 * El JWT de sesion permanece encapsulado en el SDK de Supabase y nunca
 * se almacena en este contexto ni en ninguna variable global accesible.
 *
 * El perfil se carga desde la tabla `profiles` tras detectar sesion activa.
 * Si la tabla no existe aun, se construye un perfil minimo desde auth.user.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthState, UserProfile } from '@/types';
import { supabase } from '@/services/supabase';

// ── Valor por defecto del contexto ──────────────────────────────────────────

const defaultState: AuthState = {
  user:    null,
  loading: true,
};

const AuthContext = createContext<AuthState>(defaultState);

// ── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Carga el perfil extendido del usuario desde la tabla `profiles`.
 * Si no existe, construye un perfil basico desde los metadatos de auth.
 */
async function fetchProfile(userId: string, email: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Perfil de fallback para usuarios sin registro en la tabla
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string;
    return {
      id:         userId,
      email,
      full_name:  null,
      company:    null,
      role:       email === adminEmail ? 'admin' : 'user',
      plan:       'free',
      created_at: new Date().toISOString(),
    };
  }

  return data as UserProfile;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(defaultState);

  useEffect(() => {
    // Recupera la sesion persistida al montar el provider
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? '');
        setState({ user: profile, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    });

    // Escucha cambios de sesion (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email ?? '');
          setState({ user: profile, loading: false });
        } else {
          setState({ user: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook de consumo ───────────────────────────────────────────────────────────

/**
 * Hook para consumir el AuthContext.
 * Lanza un error si se usa fuera del AuthProvider.
 */
export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return ctx;
}
