import { useEffect, useState, useCallback } from 'react';
import { supabase }       from '@/services/supabase';
import { useAuthContext } from '@/context/AuthContext';
import type { ChatMessage } from '@/types';

interface UseChatHistoryReturn {
  history:     ChatMessage[];
  sessionId:   string;
  saveMessage: (msg: ChatMessage) => Promise<void>;
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

  useEffect(() => {
    if (!user) return;
    async function loadLastSession() {
      setLoading(true);
      const { data } = await supabase
        .from('chat_history')
        .select('session_id')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        const sid = data[0].session_id as string;
        const { data: msgs } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user!.id)
          .eq('session_id', sid)
          .order('created_at', { ascending: true });
        if (msgs) {
          setHistory(msgs.map((row) => ({
            id:        row.id as string,
            role:      row.role as 'user' | 'assistant',
            content:   row.content as string,
            timestamp: new Date(row.created_at as string),
            tokens:    row.tokens as number | undefined,
          })));
          setSessionId(sid);
        }
      }
      setLoading(false);
    }
    void loadLastSession();
  }, [user]);

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

  const newSession = useCallback(() => {
    setHistory([]);
    setSessionId(generateSessionId());
  }, []);

  return { history, sessionId, saveMessage, newSession, loading };
}
