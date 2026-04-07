/**
 * Hook para obtener las automatizaciones contratadas por el cliente autenticado.
 * Los datos se combinan con el catalogo estatico para resolver titulos y metadatos.
 * Las politicas RLS garantizan que cada cliente solo ve las suyas.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { getAutomationById, type Automation } from '@/services/automations';

export type AutomationStatus = 'active' | 'paused' | 'completed';

export interface ClientAutomation {
  id:           string;
  automationId: string;
  status:       AutomationStatus;
  activatedAt:  string;
  notes:        string | null;
  /** Metadatos del catalogo estatico, null si el id no existe en el catalogo */
  catalog:      Automation | null;
}

interface UseClientAutomationsReturn {
  automations: ClientAutomation[];
  loading:     boolean;
  error:       string | null;
  refetch:     () => void;
}

export function useClientAutomations(): UseClientAutomationsReturn {
  const [automations, setAutomations] = useState<ClientAutomation[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [tick,        setTick]        = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('client_automations')
        .select('id, automation_id, status, activated_at, notes')
        .order('activated_at', { ascending: false });

      if (err || !data) {
        setError('No se pudieron cargar tus automatizaciones.');
        setLoading(false);
        return;
      }

      const mapped: ClientAutomation[] = data.map((row) => ({
        id:           row.id as string,
        automationId: row.automation_id as string,
        status:       row.status as AutomationStatus,
        activatedAt:  row.activated_at as string,
        notes:        row.notes as string | null,
        catalog:      getAutomationById(row.automation_id as string) ?? null,
      }));

      setAutomations(mapped);
      setLoading(false);
    }

    void load();
  }, [tick]);

  return {
    automations,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}
