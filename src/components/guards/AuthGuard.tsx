/**
 * AuthGuard — primera capa de control de acceso.
 * Bloquea la renderizacion de rutas privadas si no hay sesion activa.
 * Si el usuario no ha completado el onboarding, redirige a /onboarding.
 * Durante la resolucion de la sesion inicial muestra un estado de carga neutral.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext }        from '@/context/AuthContext';
import { useOnboardingStatus }  from '@/hooks/useOnboardingStatus';
import styles from './Guards.module.css';

export function AuthGuard() {
  const { user, loading }          = useAuthContext();
  const location                   = useLocation();
  const { completed, loading: onboardingLoading } = useOnboardingStatus();

  /* Sesion o onboarding aun no resueltos */
  if (loading || (user && onboardingLoading)) {
    return (
      <div className={styles.loadingScreen}>
        <span className={styles.loadingDot} />
      </div>
    );
  }

  /* Sin sesion: redirige al login preservando la ruta de origen */
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* Usuario autenticado sin onboarding completado: solo permitir /onboarding */
  if (completed === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  /* EXTRA: Si ya completó el onboarding e intenta entrar a /onboarding, lo mandamos al dashboard */
  if (completed === true && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}