/**
 * Pagina de detalle y ejecucion de una automatizacion.
 * Incluye:
 *   - Demo de ejecucion via Groq
 *   - Formulario de solicitud de implementacion a medida
 */
import { useState, type FormEvent } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getAutomationById }   from '@/services/automations';
import { useAutomation }       from '@/hooks/useAutomation';
import { useAuthContext }      from '@/context/AuthContext';
import { supabase }            from '@/services/supabase';
import { Button }              from '@/components/ui/Button/Button';
import { Textarea }            from '@/components/ui/Textarea/Textarea';
import { Input }               from '@/components/ui/Input/Input';
import { Badge }               from '@/components/ui/Badge/Badge';
import { Spinner }             from '@/components/ui/Spinner/Spinner';
import styles from './AutomationDetail.module.css';

// ── Demo de ejecucion ─────────────────────────────────────────────────────────

interface DemoSectionProps {
  promptKey: string;
}

function DemoSection({ promptKey }: DemoSectionProps) {
  const { result, loading, error, execute, reset } = useAutomation();
  const [input, setInput] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    await execute(promptKey, input);
  }

  function handleReset() {
    reset();
    setInput('');
  }

  return (
    <div className={styles.demoCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Probar demo</h2>
      </div>
      <div className={styles.layout}>
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
              Ejecutar demo
            </Button>
            {(result || error) && (
              <Button type="button" variant="ghost" onClick={handleReset}>
                Limpiar
              </Button>
            )}
          </div>
        </form>

        <section className={styles.outputPanel} aria-live="polite">
          {loading && (
            <div className={styles.loadingState}>
              <Spinner size={28} />
              <span className={styles.loadingText}>Procesando...</span>
            </div>
          )}
          {error && !loading && (
            <p className={styles.errorText}>{error}</p>
          )}
          {result && !loading && (
            <div className={styles.result}>
              <div className={styles.resultMeta}>
                <span>{result.tokens} tokens</span>
                <span>{(result.durationMs / 1000).toFixed(1)}s</span>
              </div>
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
    </div>
  );
}

// ── Formulario de solicitud ───────────────────────────────────────────────────

type RequestStep = 'form' | 'success';

interface RequestFormProps {
  automationId:   string;
  automationName: string;
}

function RequestForm({ automationId, automationName }: RequestFormProps) {
  const { user } = useAuthContext();

  const [step,     setStep]    = useState<RequestStep>('form');
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState<string | null>(null);

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [email,    setEmail]    = useState(user?.email     ?? '');
  const [company,  setCompany]  = useState(user?.company   ?? '');
  const [message,  setMessage]  = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) return;
    setSaving(true);
    setError(null);

    const { error: err } = await supabase.from('requests').insert({
      automation_id:   automationId,
      automation_name: automationName,
      full_name:       fullName.trim(),
      email:           email.trim(),
      company:         company.trim() || null,
      message:         message.trim(),
      user_id:         user?.id ?? null,
    });

    setSaving(false);

    if (err) {
      setError('No se pudo enviar la solicitud. Intentalo de nuevo.');
    } else {
      setStep('success');
    }
  }

  if (step === 'success') {
    return (
      <div className={styles.requestCard}>
        <div className={styles.successState}>
          <span className={styles.successDot} />
          <h2 className={styles.successTitle}>Solicitud recibida</h2>
          <p className={styles.successText}>
            Me pondre en contacto contigo en menos de 24 horas en{' '}
            <strong>{email}</strong> para hablar de los detalles de tu proyecto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.requestCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Solicitar implementacion</h2>
        <p className={styles.cardSubtitle}>
          Cuentame tu caso y te preparo una propuesta a medida.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.requestForm} noValidate>
        <div className={styles.row}>
          <Input
            label="Nombre completo"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
          <Input
            label="Email de contacto"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            required
          />
        </div>
        <Input
          label="Empresa (opcional)"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Nombre de tu empresa"
        />
        <Textarea
          label="Describe tu caso"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Explica brevemente que proceso quieres automatizar, cuantas personas lo usan y cual es el volumen aproximado..."
          rows={5}
          required
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.requestFooter}>
          <div className={styles.priceInfo}>
            <span className={styles.priceLabel}>Implementacion personalizada</span>
          </div>
          <Button type="submit" loading={saving} disabled={!fullName || !email || !message}>
            Enviar solicitud
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Pagina principal ──────────────────────────────────────────────────────────

export function AutomationDetail() {
  const { id }     = useParams<{ id: string }>();
  const automation = getAutomationById(id ?? '');

  if (!automation) return <Navigate to="/catalog" replace />;

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

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Precio</span>
            <span className={styles.metaValue}>desde {automation.price} EUR</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Entrega</span>
            <span className={styles.metaValue}>{automation.deliveryDays} dias laborables</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Beneficios</span>
            <div className={styles.benefits}>
              {automation.benefits.map((b) => (
                <span key={b} className={styles.benefit}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <DemoSection promptKey={automation.promptKey} />

      <RequestForm
        automationId={automation.id}
        automationName={automation.title}
      />
    </div>
  );
}