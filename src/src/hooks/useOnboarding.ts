/**
 * Hook que verifica si el usuario ha completado el onboarding.
 * Si no lo ha completado, retorna shouldOnboard=true.
 */
import { useEffect, useState } from 'react';
import { supabase }       from '@/services/supabase';
import { useAuthContext } from '@/context/AuthContext';

interface UseOnboardingReturn {
  shouldOnboard: boolean;
  loading:       boolean;
}

export function useOnboarding(): UseOnboardingReturn {
  const { user }          = useAuthContext();
  const [shouldOnboard, setShouldOnboard] = useState(false);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!user || user.role === 'superadmin') {
      setLoading(false);
      return;
    }

    async function check() {
      const { data } = await supabase
        .from('onboarding_data')
        .select('completed')
        .eq('user_id', user!.id)
        .single();

      setShouldOnboard(!data?.completed);
      setLoading(false);
    }

    void check();
  }, [user]);

  return { shouldOnboard, loading };
}
