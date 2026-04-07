/**
 * Pagina de chat con el asistente de IA.
 * Carga el historial de la ultima sesion al montar.
 * Guarda cada mensaje en Supabase via useChatHistory.
 * Muestra hora visible en cada mensaje (Timestamps corregidos).
 */
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useChat }        from '@/hooks/useChat';
import { useChatHistory } from '@/hooks/useChatHistory';
import { Button }         from '@/components/ui/Button/Button';
import { Spinner }        from '@/components/ui/Spinner/Spinner';
import styles from './Chat.module.css';

/** * Formatea de forma segura un string, numero o fecha de Supabase a HH:MM 
 */
function formatTime(dateValue: string | number | Date | undefined): string {
  if (!dateValue) return ''; // Si no hay fecha, no rompemos la app
  
  try {
    // Forzamos la conversión a objeto Date independientemente de lo que venga de BD
    const date = new Date(dateValue);
    // Verificamos que sea una fecha válida antes de formatear
    if (isNaN(date.getTime())) return ''; 
    
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return ''; // Fallback de seguridad
  }
}

export function Chat() {
  const { messages, loading, error, send, clear, setMessages } = useChat();
  const { saveMessage, newSession, loading: histLoading, history } = useChatHistory();
  const [input, setInput]         = useState('');
  const [histLoaded, setHistLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Carga el historial de la ultima sesion como estado inicial de mensajes */
  useEffect(() => {
    // Solo cargamos si no se ha cargado antes y hay historial disponible
    if (!histLoading && !histLoaded) {
      if (history && history.length > 0) {
        setMessages(history);
      }
      setHistLoaded(true); // Marcamos como cargado incluso si estaba vacío
    }
  }, [histLoading, history, histLoaded, setMessages]);

  /* Scroll automatico al ultimo mensaje de forma suave */
  useEffect(() => {
    // Usamos setTimeout para asegurar que el DOM se ha actualizado antes de hacer scroll
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    
    setInput(''); // Limpiamos input de inmediato para mejor UX
    
    // Objeto de mensaje con un Date() nativo para el UI local
    const userMsg = {
      id:        crypto.randomUUID(),
      role:      'user' as const,
      content:   text,
      timestamp: new Date(), 
    };
    
    await saveMessage(userMsg);
    
    const assistantMsg = await send(text);
    if (assistantMsg) {
      // Nos aseguramos de que el mensaje de la IA también tenga fecha local
      const msgToSave = { ...assistantMsg, timestamp: new Date() };
      await saveMessage(msgToSave);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Si pulsa Enter y no está pulsando Shift, enviamos mensaje
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    }
  }

  function handleNewSession() {
    clear();
    newSession();
    // No hace falta resetear histLoaded a menos que tu backend devuelva otro array
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
          <span style={{marginLeft: '8px'}}>Cargando historial...</span>
        </div>
      )}

      <div className={styles.messages} aria-live="polite">
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
            <div className={styles.messageHeader}>
              <span className={styles.messageRole}>
                {msg.role === 'user' ? 'Tú' : 'Asistente'}
              </span>
              {/* Ahora formatTime no reventará aunque Supabase devuelva un string ISO */}
              <span className={styles.messageTime}>{formatTime(msg.timestamp)}</span>
            </div>
            
            <pre className={styles.messageContent}>{msg.content}</pre>
            
            {msg.tokens !== undefined && (
              <span className={styles.messageMeta}>{msg.tokens} tokens</span>
            )}
          </div>
        ))}

        {loading && (
          <div className={[styles.message, styles.messageAssistant].join(' ')}>
            <div className={styles.messageHeader}>
              <span className={styles.messageRole}>Asistente escribiendo...</span>
            </div>
            <Spinner size={18} />
          </div>
        )}

        {error && (
          <div className={styles.errorMsg} role="alert">{error}</div>
        )}

        {/* Ancla invisible para el scroll */}
        <div ref={bottomRef} style={{ float:"left", clear: "both", paddingBottom: "1rem" }} />
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
          maxLength={2000}
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