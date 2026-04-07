import React from 'react';
import type { ToastItem } from '@/context/ToastContext'; // Ajusta la ruta si es necesario
import styles from './Toast.module.css';

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  // Si no hay toasts, no renderizamos el contenedor
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer} aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.variant]}`}>
          
          {/* Icono según la variante (opcional, pero queda muy bien) */}
          <div className={styles.icon}>
            {toast.variant === 'success' && '✓'}
            {toast.variant === 'error' && '✕'}
            {toast.variant === 'info' && 'i'}
            {toast.variant === 'warning' && '⚠'}
          </div>

          <p className={styles.message}>{toast.message}</p>
          
          <button 
            className={styles.closeButton} 
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}