import styles from './Spinner.module.css';

interface SpinnerProps {
  /** Tamano en px. Por defecto: 24 */
  size?: number;
}

export function Spinner({ size = 24 }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Cargando"
    />
  );
}
