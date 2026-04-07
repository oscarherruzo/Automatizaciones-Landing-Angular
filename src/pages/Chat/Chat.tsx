/**
 * Interfaz de chat general con el asistente de automatizaciones.
 * XSS: todo el contenido del asistente se renderiza como texto plano via <pre>.
 * El historial se mantiene en memoria local; no persiste entre recargas.
 */
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/Button/Button';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import styles from './Chat.module.css';

export function Chat() {
  const { messages, loading, error, send, clear } = useChat();
  const [input,    setInput]    = useState('');
  const bottomRef  = useRef<HTMLDivElement>(null);

  // Auto-scroll al ultimo mensaje cuando cambia la lista
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    await send(text);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enviar con Enter; nueva linea con Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input).then(() => setInput(''));
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Asistente</h1>
          <p className={styles.subtitle}>Consultas sobre automatizacion y procesos</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Nueva conversacion
          </Button>
        )}
      </header>

      {/* Historial de mensajes */}
      <div className={styles.messages} aria-live="polite" aria-label="Conversacion">
        {messages.length === 0 && (
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
            {/* SEGURIDAD: renderizado como texto preformateado, sin parsear HTML */}
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

        {error && (
          <div className={styles.errorMsg} role="alert">{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Campo de entrada */}
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
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          loading={loading}
        >
          Enviar
        </Button>
      </form>
    </div>
  );
}
