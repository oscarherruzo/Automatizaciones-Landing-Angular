/**
 * Hook de estadisticas globales de la plataforma.
 * Solo debe usarse en vistas accesibles para el rol 'superadmin'.
 * Las politicas RLS de Supabase lo garantizan a nivel de DB;
 * el RoleGuard lo garantiza a nivel de UI.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import type { UserRole } from '@/types';

export interface AdminStats {
  totalUsers:  number;
  newThisWeek: number;
  byRole:      Record<UserRole, number>;
  byPlan:      Record<'free' | 'pro' | 'enterprise', number>;
}

interface UseAdminStatsReturn {
  stats:   AdminStats | null;
  loading: boolean;
  error:   string | null;
}

const INITIAL_BY_ROLE: Record<UserRole, number>                 = { superadmin: 0, client: 0 };
const INITIAL_BY_PLAN: Record<'free' | 'pro' | 'enterprise', number> = { free: 0, pro: 0, enterprise: 0 };

export function useAdminStats(): UseAdminStatsReturn {
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('role, plan, created_at');

      if (err || !data) {
        setError('No se pudieron cargar las estadisticas de la plataforma.');
        setLoading(false);
        return;
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const result: AdminStats = {
        totalUsers:  data.length,
        newThisWeek: 0,
        byRole:      { ...INITIAL_BY_ROLE },
        byPlan:      { ...INITIAL_BY_PLAN },
      };

      for (const row of data) {
        if (row.role === 'superadmin' || row.role === 'client') {
          result.byRole[row.role as UserRole]++;
        }
        if (row.plan === 'free' || row.plan === 'pro' || row.plan === 'enterprise') {
          result.byPlan[row.plan as 'free' | 'pro' | 'enterprise']++;
        }
        if (new Date(row.created_at) >= oneWeekAgo) {
          result.newThisWeek++;
        }
      }

      setStats(result);
      setLoading(false);
    }

    void load();
  }, []);

  return { stats, loading, error };
}
