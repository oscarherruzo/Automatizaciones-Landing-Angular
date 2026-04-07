/**
 * Componente Button reutilizable.
 * Soporta variantes visuales, estados de carga y todos los atributos HTML nativos.
 */
import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  fullWidth = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ].join(' ').trim();

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : children}
    </button>
  );
}
