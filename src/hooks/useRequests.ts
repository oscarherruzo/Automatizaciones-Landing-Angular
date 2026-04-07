/**
 * Hook para gestionar solicitudes de implementacion.
 * Superadmin: lista todas las solicitudes y puede cambiar su estado.
 * Cliente: solo ve las suyas.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';

export type RequestStatus = 'pending' | 'contacted' | 'in_progress' | 'completed' | 'rejected';

export interface AutomationRequest {
  id:             string;
  automationId:   string;
  automationName: string;
  fullName:       string;
  email:          string;
  company:        string | null;
  message:        string;
  status:         RequestStatus;
  userId:         string | null;
  createdAt:      string;
  updatedAt:      string;
}

interface UseRequestsReturn {
  requests:     AutomationRequest[];
  loading:      boolean;
  error:        string | null;
  updateStatus: (id: string, status: RequestStatus) => Promise<void>;
  refetch:      () => void;
}

function mapRow(row: Record<string, unknown>): AutomationRequest {
  return {
    id:             row.id as string,
    automationId:   row.automation_id as string,
    automationName: row.automation_name as string,
    fullName:       row.full_name as string,
    email:          row.email as string,
    company:        row.company as string | null,
    message:        row.message as string,
    status:         row.status as RequestStatus,
    userId:         row.user_id as string | null,
    createdAt:      row.created_at as string,
    updatedAt:      row.updated_at as string,
  };
}

export function useRequests(): UseRequestsReturn {
  const [requests, setRequests] = useState<AutomationRequest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (err || !data) {
        setError('No se pudieron cargar las solicitudes.');
      } else {
        setRequests(data.map((r) => mapRow(r as Record<string, unknown>)));
        setError(null);
      }
      setLoading(false);
    }
    void load();
  }, [tick]);

  const updateStatus = useCallback(async (id: string, status: RequestStatus) => {
    const { error: err } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id);

    if (!err) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    }
  }, []);

  return {
    requests,
    loading,
    error,
    updateStatus,
    refetch: () => setTick((t) => t + 1),
  };
}