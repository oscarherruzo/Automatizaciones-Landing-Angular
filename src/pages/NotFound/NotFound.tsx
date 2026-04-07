import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Pagina no encontrada</h1>
      <p className={styles.text}>La ruta solicitada no existe.</p>
      <Link to="/dashboard" className={styles.link}>Volver al panel</Link>
    </div>
  );
}
