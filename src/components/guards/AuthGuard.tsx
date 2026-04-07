/**
 * AuthGuard — primera capa de control de acceso.
 * Bloquea la renderizacion de rutas privadas si no hay sesion activa.
 * Durante la resolucion de la sesion inicial muestra un estado de carga neutral.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import styles from './Guards.module.css';

export function AuthGuard() {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  // Sesion aun no resuelta: evita un flash de redireccion
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <span className={styles.loadingDot} />
      </div>
    );
  }

  // Sin sesion: redirige al login preservando la ruta de origen para post-login redirect
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
