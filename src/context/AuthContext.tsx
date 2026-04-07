import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthState, UserProfile } from '@/types';
import { supabase } from '@/services/supabase';

const noop = async () => {};

const defaultState: AuthState = {
  user:           null,
  loading:        true,
  refreshProfile: noop,
};

const AuthContext = createContext<AuthState>(defaultState);

interface AuthProviderProps { children: ReactNode; }

async function fetchProfile(userId: string, email: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string;
    return {
      id:         userId,
      email,
      full_name:  null,
      company:    null,
      role:       email === adminEmail ? 'superadmin' : 'client',
      plan:       'free',
      created_at: new Date().toISOString(),
    };
  }

  return data as UserProfile;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const profile = await fetchProfile(session.user.id, session.user.email ?? '');
    setUser(profile);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? '');
        setUser(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email ?? '');
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return ctx;
}