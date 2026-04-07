/**
 * Pagina de inicio de sesion.
 * Tras autenticacion exitosa redirige al dashboard o a la ruta de origen
 * si el usuario llego desde una ruta protegida.
 */
import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthContext } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from './Login.module.css';

export function Login() {
  const { user, loading: sessionLoading } = useAuthContext();
  const { signIn, loading }               = useAuth();
  const navigate                          = useNavigate();
  const location                          = useLocation();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);

  // Si ya hay sesion activa, redirige directamente
  if (!sessionLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const err = await signIn(email, password);
    if (err) {
      setError(err);
    } else {
      navigate(from, { replace: true });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Oscar Herruzo</h1>
          <p className={styles.subtitle}>Panel de automatizaciones</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
            placeholder="Introduce tu contrasena"
            autoComplete="current-password"
            required
          />
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} fullWidth size="lg">
            Acceder
          </Button>
        </form>
      </div>
    </div>
  );
}
