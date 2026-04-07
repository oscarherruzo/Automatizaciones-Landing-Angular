/**
 * Comprueba si el usuario autenticado ha completado el onboarding.
 * Consulta la tabla onboarding_data y devuelve el estado completed.
 */
import { useEffect, useState } from 'react';
import { supabase }       from '@/services/supabase';
import { useAuthContext } from '@/context/AuthContext';

interface UseOnboardingStatusReturn {
  completed: boolean | null;
  loading:   boolean;
}

export function useOnboardingStatus(): UseOnboardingStatusReturn {
  const { user } = useAuthContext();
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function check() {
      const { data } = await supabase
        .from('onboarding_data')
        .select('completed')
        .eq('user_id', user!.id)
        .maybeSingle();

      setCompleted(data?.completed === true);
      setLoading(false);
    }

    void check();
  }, [user]);

  return { completed, loading };
}
