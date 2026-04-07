import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant]].join(' ')}>
      {children}
    </span>
  );
}
