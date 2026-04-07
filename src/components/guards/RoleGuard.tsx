/**
 * RoleGuard — segunda capa de control de acceso (RBAC).
 * Se compone dentro de AuthGuard; asume que el usuario ya esta autenticado.
 * Bloquea la renderizacion si el rol del usuario no esta en la lista permitida.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  /** Roles que tienen acceso a las rutas hijas */
  allowedRoles: UserRole[];
  /** Ruta de redireccion si el rol no tiene acceso. Por defecto: /dashboard */
  redirectTo?: string;
}

export function RoleGuard({
  allowedRoles,
  redirectTo = '/dashboard',
}: RoleGuardProps) {
  const { user } = useAuthContext();

  // Este guard siempre va dentro de AuthGuard, pero se defiende igualmente
  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
