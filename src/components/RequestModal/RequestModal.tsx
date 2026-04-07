/**
 * Modal de solicitud rapida de implementacion.
 * Se abre desde la tarjeta del catalogo sin salir de la pagina.
 */
import { useState, useEffect, type FormEvent } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { supabase }       from '@/services/supabase';
import { Input }          from '@/components/ui/Input/Input';
import { Button }         from '@/components/ui/Button/Button';
import { Textarea }       from '@/components/ui/Textarea/Textarea';
import type { Automation } from '@/types';
import styles from './RequestModal.module.css';

interface RequestModalProps {
  automation: Automation;
  onClose:    () => void;
}

type Step = 'form' | 'success';

export function RequestModal({ automation, onClose }: RequestModalProps) {
  const { user } = useAuthContext();

  const [step,     setStep]    = useState<Step>('form');
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [email,    setEmail]    = useState(user?.email     ?? '');
  const [company,  setCompany]  = useState(user?.company   ?? '');
  const [message,  setMessage]  = useState('');

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) return;
    setSaving(true);
    setError(null);

    const { error: dbError } = await supabase.from('requests').insert({
      automation_id:   automation.id,
      automation_name: automation.title,
      full_name:       fullName.trim(),
      email:           email.trim(),
      company:         company.trim() || null,
      message:         message.trim(),
      user_id:         user?.id ?? null,
    });

    if (dbError) {
      setError('No se pudo enviar la solicitud. Intentalo de nuevo.');
      setSaving(false);
      return;
    }

    setSaving(false);
    setStep('success');
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {step === 'success' ? (
          <div className={styles.success}>
            <span className={styles.successDot} />
            <h2 className={styles.successTitle}>Solicitud enviada</h2>
            <p className={styles.successText}>
              Me pondre en contacto contigo en menos de 24 horas en{' '}
              <strong>{email}</strong>.
            </p>
            <Button type="button" onClick={onClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalLabel}>{automation.category}</p>
                <h2 className={styles.modalTitle}>{automation.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
                  label="Email"
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
                label="Describe tu necesidad"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Que proceso quieres automatizar?"
                rows={4}
                required
              />

              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Implementacion desde</span>
                <span className={styles.priceValue}>{automation.price} EUR</span>
                <span className={styles.priceDays}>— {automation.deliveryDays} dias lab.</span>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <Button
                type="submit"
                loading={saving}
                fullWidth
                disabled={!fullName || !email || !message}
              >
                Enviar solicitud
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}