/**
 * Pagina de ajustes del perfil de usuario.
 */
import { useState, type FormEvent } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from './Settings.module.css';

export function Settings() {
  const { user }   = useAuthContext();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [company,  setCompany]  = useState(user?.company   ?? '');
  const [saving,   setSaving]   = useState(false);
  const [message,  setMessage]  = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, company })
      .eq('id', user.id);

    setSaving(false);
    setMessage(
      error
        ? { text: 'No se pudo guardar. Intentalo de nuevo.', ok: false }
        : { text: 'Perfil actualizado correctamente.', ok: true }
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ajustes</h1>
        <p className={styles.subtitle}>Informacion del perfil y cuenta</p>
      </header>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Datos del perfil</h2>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            value={user?.email ?? ''}
            disabled
            hint="El email no es editable desde aqui."
          />
          <Input
            label="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre y apellidos"
          />
          <Input
            label="Empresa"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Nombre de tu empresa"
          />
          {message && (
            <p
              className={message.ok ? styles.success : styles.error}
              role="status"
            >
              {message.text}
            </p>
          )}
          <Button type="submit" loading={saving}>
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  );
}
