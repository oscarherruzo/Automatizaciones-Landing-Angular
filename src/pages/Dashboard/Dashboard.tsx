/**
 * Pagina principal del panel: resumen de actividad del usuario.
 */
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { AUTOMATIONS } from '@/services/automations';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './Dashboard.module.css';

/** Estadisticas estaticas de ejemplo. En produccion vendrian de Supabase. */
const STATS = [
  { label: 'Automatizaciones disponibles', value: String(AUTOMATIONS.length) },
  { label: 'Tiempo ahorrado estimado',     value: '12h / semana' },
  { label: 'Procesos optimizables',        value: '8' },
];

export function Dashboard() {
  const { user } = useAuthContext();

  const greeting = user?.full_name
    ? `Bienvenido, ${user.full_name.split(' ')[0]}`
    : 'Panel de control';

  const featured = AUTOMATIONS.slice(0, 3);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{greeting}</h1>
          <p className={styles.subtitle}>
            {user?.company ? `${user.company} — ` : ''}
            <span className={styles.planBadge}>{user?.plan ?? 'free'}</span>
          </p>
        </div>
      </header>

      {/* Estadisticas rapidas */}
      <section className={styles.statsGrid} aria-label="Estadisticas">
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Automatizaciones destacadas */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Automatizaciones recomendadas</h2>
          <Link to="/catalog" className={styles.seeAll}>Ver catalogo completo</Link>
        </div>
        <div className={styles.cardsGrid}>
          {featured.map((automation) => (
            <Link
              key={automation.id}
              to={`/catalog/${automation.id}`}
              className={styles.card}
            >
              <div className={styles.cardTop}>
                <Badge variant="accent">{automation.category}</Badge>
                <Badge variant="default">{automation.complexity}</Badge>
              </div>
              <h3 className={styles.cardTitle}>{automation.title}</h3>
              <p className={styles.cardSummary}>{automation.summary}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardPrice}>desde {automation.price} EUR</span>
                <span className={styles.cardDays}>{automation.deliveryDays} dias</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
