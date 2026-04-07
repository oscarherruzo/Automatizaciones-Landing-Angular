/**
 * Pagina de registro de nuevos clientes.
 *
 * Flujo:
 *   1. Usuario completa el formulario (email, contrasena, nombre, empresa opcional).
 *   2. Se llama a supabase.auth.signUp con los metadatos en raw_user_meta_data.
 *   3. El trigger `on_auth_user_created` en Supabase crea automaticamente
 *      el perfil en la tabla `profiles` con role='client' y plan='free'.
 *   4a. Si la confirmacion de email esta desactivada en Supabase: el usuario
 *       queda autenticado y se le redirige al dashboard.
 *   4b. Si la confirmacion de email esta activada: se muestra un mensaje
 *       pidiendo que verifique su bandeja de entrada.
 */
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase }          from '@/services/supabase';
import { useAuthContext }    from '@/context/AuthContext';
import { Input }             from '@/components/ui/Input/Input';
import { Button }            from '@/components/ui/Button/Button';
import styles from './Register.module.css';

type Step = 'form' | 'confirm-email';

export function Register() {
  const { user, loading: sessionLoading } = useAuthContext();
  const navigate = useNavigate();

  const [step,      setStep]      = useState<Step>('form');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const [fullName,  setFullName]  = useState('');
  const [company,   setCompany]   = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');

  // Si ya hay sesion, ir directo al dashboard
  if (!sessionLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim() || null,
          company:   company.trim()  || null,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Este email ya esta registrado. Accede con tu contrasena.');
      } else {
        setError('Error al crear la cuenta. Intentalo de nuevo.');
      }
      return;
    }

    /* Si hay sesion activa, redirigir al onboarding para que el usuario
       configure su perfil antes de acceder al dashboard */
    if (data.session) {
      navigate('/onboarding', { replace: true });
    } else {
      setStep('confirm-email');
    }
  }

  if (step === 'confirm-email') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Revisa tu email</h1>
            <p className={styles.subtitle}>Confirmacion pendiente</p>
          </div>
          <div className={styles.confirmBody}>
            <p className={styles.confirmText}>
              Te hemos enviado un enlace de confirmacion a{' '}
              <strong className={styles.highlight}>{email}</strong>.
              Haz clic en el enlace para activar tu cuenta.
            </p>
            <p className={styles.confirmNote}>
              Si no lo ves en unos minutos, revisa la carpeta de spam.
            </p>
          </div>
          <Link to="/login" className={styles.backLink}>
            Volver al inicio de sesion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Oscar Herruzo</h1>
          <p className={styles.subtitle}>Crear cuenta de cliente</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.row}>
            <Input
              label="Nombre completo"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              required
            />
            <Input
              label="Empresa (opcional)"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nombre de tu empresa"
              autoComplete="organization"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            autoComplete="email"
            required
          />
          <Input
            label="Contrasena"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimo 8 caracteres"
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirmar contrasena"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repite la contrasena"
            autoComplete="new-password"
            required
          />

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg">
            Crear cuenta
          </Button>
        </form>

        <p className={styles.loginPrompt}>
          Ya tienes cuenta?{' '}
          <Link to="/login" className={styles.loginLink}>
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
