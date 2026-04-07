/**
 * Pagina de detalle y ejecucion de una automatizacion especifica.
 * El output se renderiza como texto plano para prevenir XSS.
 * No se usa dangerouslySetInnerHTML bajo ningun concepto.
 */
import { useState, type FormEvent } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getAutomationById } from '@/services/automations';
import { useAutomation } from '@/hooks/useAutomation';
import { Button } from '@/components/ui/Button/Button';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Badge } from '@/components/ui/Badge/Badge';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import styles from './AutomationDetail.module.css';

export function AutomationDetail() {
  const { id }        = useParams<{ id: string }>();
  const automation    = getAutomationById(id ?? '');
  const { result, loading, error, execute, reset } = useAutomation();
  const [input, setInput] = useState('');

  if (!automation) return <Navigate to="/catalog" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    await execute(automation.promptKey, input);
  }

  function handleReset() {
    reset();
    setInput('');
  }

  return (
    <div className={styles.page}>
      <Link to="/catalog" className={styles.back}>Volver al catalogo</Link>

      <header className={styles.header}>
        <div className={styles.badges}>
          <Badge variant="accent">{automation.category}</Badge>
          <Badge variant="default">{automation.complexity}</Badge>
        </div>
        <h1 className={styles.title}>{automation.title}</h1>
        <p className={styles.description}>{automation.description}</p>
      </header>

      <div className={styles.layout}>
        {/* Panel de entrada */}
        <section className={styles.inputPanel}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Textarea
              label="Describe tu caso o introduce el contenido a procesar"
              placeholder="Escribe aqui el contexto que necesita esta automatizacion..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              required
            />
            <div className={styles.formActions}>
              <Button type="submit" loading={loading} disabled={!input.trim()}>
                Ejecutar
              </Button>
              {(result || error) && (
                <Button type="button" variant="ghost" onClick={handleReset}>
                  Limpiar
                </Button>
              )}
            </div>
          </form>
        </section>

        {/* Panel de resultado */}
        <section className={styles.outputPanel} aria-live="polite">
          {loading && (
            <div className={styles.loadingState}>
              <Spinner size={28} />
              <span className={styles.loadingText}>Procesando...</span>
            </div>
          )}

          {error && !loading && (
            <div className={styles.errorState}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className={styles.result}>
              <div className={styles.resultMeta}>
                <span>{result.tokens} tokens</span>
                <span>{(result.durationMs / 1000).toFixed(1)}s</span>
              </div>
              {/* OUTPUT: se renderiza como texto preformateado, nunca como HTML */}
              <pre className={styles.resultText}>{result.text}</pre>
            </div>
          )}

          {!result && !loading && !error && (
            <div className={styles.emptyState}>
              <p>El resultado aparecera aqui</p>
            </div>
          )}
        </section>
      </div>

      {/* Informacion de precio */}
      <div className={styles.pricingNote}>
        <span>Implementacion a medida desde</span>
        <strong className={styles.price}>{automation.price} EUR</strong>
        <span>— entrega en {automation.deliveryDays} dias laborables</span>
      </div>
    </div>
  );
}
