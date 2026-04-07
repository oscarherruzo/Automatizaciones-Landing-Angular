/**
 * Pagina de ajustes.
 * Seccion 1: editar nombre y empresa.
 * Seccion 2: cambiar contrasena.
 */
import { useState, type FormEvent } from 'react';
import { useAuthContext }  from '@/context/AuthContext';
import { supabase }        from '@/services/supabase';
import { Input }           from '@/components/ui/Input/Input';
import { Button }          from '@/components/ui/Button/Button';
import { Badge }           from '@/components/ui/Badge/Badge';
import styles from './Settings.module.css';

type Feedback = { text: string; ok: boolean } | null;

function ProfileSection() {
  const { user, refreshProfile } = useAuthContext();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [company,  setCompany]  = useState(user?.company   ?? '');
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setFeedback(null);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null, company: company.trim() || null })
      .eq('id', user.id);
    if (error) {
      setFeedback({ text: 'No se pudo guardar. Intentalo de nuevo.', ok: false });
    } else {
      await refreshProfile();
      setFeedback({ text: 'Perfil actualizado correctamente.', ok: true });
    }
    setSaving(false);
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Datos del perfil</h2>
        <div className={styles.badges}>
          <Badge variant={user?.role === 'superadmin' ? 'warning' : 'default'}>
            {user?.role ?? '—'}
          </Badge>
          <Badge variant={user?.plan === 'free' ? 'default' : 'success'}>
            {user?.plan ?? '—'}
          </Badge>
        </div>
      </div>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          label="Email"
          type="email"
          value={user?.email ?? ''}
          disabled
          hint="El email no se puede modificar desde aqui."
        />
        <div className={styles.row}>
          <Input
            label="Nombre completo"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre y apellidos"
            autoComplete="name"
          />
          <Input
            label="Empresa"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Nombre de tu empresa"
            autoComplete="organization"
          />
        </div>
        {feedback && (
          <p className={feedback.ok ? styles.success : styles.error} role="status">
            {feedback.text}
          </p>
        )}
        <div className={styles.formFooter}>
          <Button type="submit" loading={saving}>Guardar cambios</Button>
        </div>
      </form>
    </div>
  );
}

function PasswordSection() {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    if (next.length < 8) {
      setFeedback({ text: 'La nueva contrasena debe tener al menos 8 caracteres.', ok: false });
      return;
    }
    if (next !== confirm) {
      setFeedback({ text: 'Las contrasenas no coinciden.', ok: false });
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email ?? '';
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (signInError) {
      setFeedback({ text: 'La contrasena actual no es correcta.', ok: false });
      setSaving(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) {
      setFeedback({ text: 'No se pudo cambiar la contrasena. Intentalo de nuevo.', ok: false });
    } else {
      setFeedback({ text: 'Contrasena actualizada correctamente.', ok: true });
      setCurrent(''); setNext(''); setConfirm('');
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Cambiar contrasena</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          label="Contrasena actual"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Tu contrasena actual"
          autoComplete="current-password"
          required
        />
        <div className={styles.row}>
          <Input
            label="Nueva contrasena"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Minimo 8 caracteres"
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirmar contrasena"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repite la nueva contrasena"
            autoComplete="new-password"
            required
          />
        </div>
        {feedback && (
          <p className={feedback.ok ? styles.success : styles.error} role="status">
            {feedback.text}
          </p>
        )}
        <div className={styles.formFooter}>
          <Button type="submit" loading={saving}>Cambiar contrasena</Button>
        </div>
      </form>
    </div>
  );
}

export function Settings() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ajustes</h1>
        <p className={styles.subtitle}>Informacion del perfil y seguridad de la cuenta</p>
      </header>
      <div className={styles.sections}>
        <ProfileSection />
        <PasswordSection />
      </div>
    </div>
  );
}