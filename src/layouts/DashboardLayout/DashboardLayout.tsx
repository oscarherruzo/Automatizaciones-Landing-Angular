/**
 * Wrapper de pagina para el panel de control.
 * Compone el Sidebar con el area de contenido principal.
 */
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/layouts/Sidebar/Sidebar';
import styles from './DashboardLayout.module.css';

export function DashboardLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
