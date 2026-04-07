/**
 * Hook para persistir el historial de chat en Supabase.
 * Carga las ultimas N sesiones y permite guardar mensajes nuevos.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase }       from '@/services/supabase';
import { useAuthContext } from '@/context/AuthContext';
import type { ChatMessage } from '@/types';

interface UseChatHistoryReturn {
  history:     ChatMessage[];
  sessionId:   string;
  saveMessage: (msg: ChatMessage) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  newSession:  () => void;
  loading:     boolean;
}

function generateSessionId(): string {
  return crypto.randomUUID();
}

export function useChatHistory(): UseChatHistoryReturn {
  const { user }    = useAuthContext();
  const [history,   setHistory]   = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(generateSessionId);
  const [loading,   setLoading]   = useState(false);

  // Cargar ultima sesion al montar
  useEffect(() => {
    if (!user) return;

    async function loadLastSession() {
      setLoading(true);
      const { data } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const lastSessionId = data[0].session_id as string;
        await loadSessionById(lastSessionId);
      }
      setLoading(false);
    }

    void loadLastSession();
  }, [user]);

  async function loadSessionById(sid: string) {
    if (!user) return;
    const { data } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sid)
      .order('created_at', { ascending: true });

    if (data) {
      const msgs: ChatMessage[] = data.map((row) => ({
        id:        row.id as string,
        role:      row.role as 'user' | 'assistant',
        content:   row.content as string,
        timestamp: new Date(row.created_at as string),
        tokens:    row.tokens as number | undefined,
      }));
      setHistory(msgs);
      setSessionId(sid);
    }
  }

  const saveMessage = useCallback(async (msg: ChatMessage) => {
    if (!user) return;
    await supabase.from('chat_history').insert({
      user_id:    user.id,
      role:       msg.role,
      content:    msg.content,
      tokens:     msg.tokens ?? null,
      session_id: sessionId,
    });
  }, [user, sessionId]);

  const loadSession = useCallback(async (sid: string) => {
    await loadSessionById(sid);
  }, [user]);

  const newSession = useCallback(() => {
    setHistory([]);
    setSessionId(generateSessionId());
  }, []);

  return { history, sessionId, saveMessage, loadSession, newSession, loading };
}
