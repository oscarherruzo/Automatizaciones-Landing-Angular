/**
 * Sidebar del panel de control.
 * Renderiza la navegacion principal con estado activo basado en la ruta actual.
 * El enlace de admin solo se renderiza si el usuario tiene rol 'superadmin'.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './Sidebar.module.css';

interface NavItem {
  path:  string;
  label: string;
  /** Restriccion de rol. undefined = accesible para todos */
  role?: 'superadmin';
}

/** Definicion de items de navegacion. Sin emojis: se usan indicadores geometricos. */
const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',          label: 'Panel' },
  { path: '/catalog',            label: 'Catalogo' },
  { path: '/chat',               label: 'Asistente' },
  { path: '/settings',           label: 'Ajustes' },
  { path: '/admin',              label: 'Administracion', role: 'superadmin' },
];

export function Sidebar() {
  const { user }   = useAuthContext();
  const { signOut } = useAuth();
  const navigate    = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.role || item.role === user?.role
  );

  return (
    <aside className={styles.sidebar}>
      {/* Logo / marca */}
      <div className={styles.brand}>
        <span className={styles.brandName}>Oscar Herruzo</span>
        <span className={styles.brandSub}>Automatizaciones</span>
      </div>

      {/* Navegacion principal */}
      <nav className={styles.nav} aria-label="Navegacion principal">
        <ul className={styles.navList}>
          {visibleItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  [styles.navItem, isActive ? styles.navItemActive : ''].join(' ').trim()
                }
              >
                <span className={styles.navDot} aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer del sidebar: usuario y logout */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user?.full_name ?? user?.email ?? 'Usuario'}
          </span>
          <span className={styles.userPlan}>{user?.plan ?? 'free'}</span>
        </div>
        <button
          className={styles.signOutBtn}
          onClick={handleSignOut}
          aria-label="Cerrar sesion"
        >
          Salir
        </button>
      </div>
    </aside>
  );
}
