/**
 * Hook que gestiona el historial de mensajes y las llamadas al chat general Groq.
 * El historial se mantiene en memoria local; no se persiste entre recargas.
 */
import { useState, useCallback } from 'react';
import { sendChatMessage } from '@/services/groq';
import type { ChatMessage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  loading:  boolean;
  error:    string | null;
  send:     (content: string) => Promise<void>;
  clear:    () => void;
}

/** Genera un id unico simple para cada mensaje */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useChat(): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const send = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Agrega el mensaje del usuario al historial de forma inmediata (optimistic update)
    const userMsg: ChatMessage = {
      id:        generateId(),
      role:      'user',
      content:   content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      // Envia el historial completo incluyendo el mensaje recien agregado
      const history = [...messages, userMsg].map(({ role, content: c }) => ({
        role,
        content: c,
      }));

      const { text, tokens } = await sendChatMessage(history);

      const assistantMsg: ChatMessage = {
        id:        generateId(),
        role:      'assistant',
        content:   text,
        timestamp: new Date(),
        tokens,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al enviar el mensaje: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, send, clear };
}
