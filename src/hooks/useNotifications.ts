/**
 * Hook de notificaciones in-app para clientes.
 * Detecta cambios de estado en sus solicitudes comparando con el ultimo estado visto.
 * El badge desaparece cuando el usuario visita /projects.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase }       from '@/services/supabase';
import { useAuthContext } from '@/context/AuthContext';

const STORAGE_KEY = 'last_seen_request_statuses';

interface UseNotificationsReturn {
  unreadCount: number;
  clearNotifications: () => void;
}

/** Lee el mapa guardado en localStorage { requestId: status } */
function readStored(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function useNotifications(): UseNotificationsReturn {
  const { user }           = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);

  const check = useCallback(async () => {
    if (!user || user.role !== 'client') { setUnreadCount(0); return; }

    const { data } = await supabase
      .from('requests')
      .select('id, status')
      .eq('user_id', user.id);

    if (!data) return;

    const stored = readStored();
    let changed  = 0;

    for (const row of data) {
      const id     = row.id as string;
      const status = row.status as string;
      /* Solo cuenta si el estado cambio respecto al ultimo visto */
      if (stored[id] !== undefined && stored[id] !== status) changed++;
    }

    setUnreadCount(changed);
  }, [user]);

  /* Comprueba al montar y cada 60 segundos */
  useEffect(() => {
    void check();
    const interval = setInterval(() => void check(), 60_000);
    return () => clearInterval(interval);
  }, [check]);

  /* Al limpiar: guarda los estados actuales como "vistos" */
  const clearNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('requests')
      .select('id, status')
      .eq('user_id', user.id);

    if (data) {
      const map: Record<string, string> = {};
      for (const row of data) { map[row.id as string] = row.status as string; }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    }
    setUnreadCount(0);
  }, [user]);

  return { unreadCount, clearNotifications };
}
