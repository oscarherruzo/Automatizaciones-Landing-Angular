/**
 * Interfaz de chat con el asistente.
 * El historial se persiste en Supabase via useChatHistory.
 * XSS: todo el contenido se renderiza como texto plano via <pre>.
 */
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useChat }        from '@/hooks/useChat';
import { useChatHistory } from '@/hooks/useChatHistory';
import { Button }         from '@/components/ui/Button/Button';
import { Spinner }        from '@/components/ui/Spinner/Spinner';
import styles from './Chat.module.css';

export function Chat() {
  const { messages, loading, error, send, clear, setMessages } = useChat();
  const { saveMessage, newSession, loading: histLoading } = useChatHistory();
  const [input,    setInput]    = useState('');
  const bottomRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');

    const userMsg = {
      id:        crypto.randomUUID(),
      role:      'user' as const,
      content:   text,
      timestamp: new Date(),
    };

    await saveMessage(userMsg);
    const assistantMsg = await send(text);
    if (assistantMsg) await saveMessage(assistantMsg);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    }
  }

  function handleNewSession() {
    clear();
    newSession();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Asistente</h1>
          <p className={styles.subtitle}>Consultas sobre automatizacion y procesos</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleNewSession}>
            Nueva conversacion
          </Button>
        )}
      </header>

      {histLoading && (
        <div className={styles.histLoading}>
          <Spinner size={18} />
          <span>Cargando historial...</span>
        </div>
      )}

      <div className={styles.messages} aria-live="polite" aria-label="Conversacion">
        {messages.length === 0 && !histLoading && (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Sin mensajes</p>
            <p className={styles.emptyHint}>
              Pregunta sobre automatizaciones, costes, implementacion o cualquier proceso de tu empresa.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={[
              styles.message,
              msg.role === 'user' ? styles.messageUser : styles.messageAssistant,
            ].join(' ')}
          >
            <span className={styles.messageRole}>
              {msg.role === 'user' ? 'Tu' : 'Asistente'}
            </span>
            <pre className={styles.messageContent}>{msg.content}</pre>
            {msg.tokens && (
              <span className={styles.messageMeta}>{msg.tokens} tokens</span>
            )}
          </div>
        ))}

        {loading && (
          <div className={[styles.message, styles.messageAssistant].join(' ')}>
            <span className={styles.messageRole}>Asistente</span>
            <Spinner size={18} />
          </div>
        )}

        {error && <div className={styles.errorMsg} role="alert">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <textarea
          className={styles.inputField}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu consulta... (Enter para enviar, Shift+Enter para nueva linea)"
          rows={3}
          disabled={loading}
        />
        <Button type="submit" disabled={!input.trim() || loading} loading={loading}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
