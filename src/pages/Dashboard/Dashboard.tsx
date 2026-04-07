/**
 * Dashboard principal.
 *
 * Vista superadmin: metricas de plataforma (usuarios, nuevos esta semana, clientes de pago)
 *                   + acceso rapido a la administracion.
 * Vista client:     automatizaciones contratadas (desde Supabase via useClientAutomations)
 *                   + estadisticas personalizadas segun plan.
 */
import { Link }                    from 'react-router-dom';
import { useAuthContext }           from '@/context/AuthContext';
import { useAdminStats }            from '@/hooks/useAdminStats';
import { useClientAutomations }     from '@/hooks/useClientAutomations';
import { AUTOMATIONS }              from '@/services/automations';
import { Badge }                    from '@/components/ui/Badge/Badge';
import { Spinner }                  from '@/components/ui/Spinner/Spinner';
import styles from './Dashboard.module.css';

// ── Vista superadmin ──────────────────────────────────────────────────────────

function SuperadminDashboard() {
  const { stats, loading, error } = useAdminStats();

  if (loading) return <div className={styles.centered}><Spinner size={28} /></div>;
  if (error)   return <p className={styles.error} role="alert">{error}</p>;

  return (
    <>
      <section className={styles.statsGrid} aria-label="Estadisticas de plataforma">
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats?.totalUsers ?? 0}</span>
          <span className={styles.statLabel}>Usuarios registrados</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats?.newThisWeek ?? 0}</span>
          <span className={styles.statLabel}>Nuevos esta semana</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {(stats?.byPlan.pro ?? 0) + (stats?.byPlan.enterprise ?? 0)}
          </span>
          <span className={styles.statLabel}>Clientes de pago</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats?.byPlan.free ?? 0}</span>
          <span className={styles.statLabel}>Plan gratuito</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Acciones rapidas</h2>
        </div>
        <div className={styles.quickActions}>
          <Link to="/admin" className={styles.actionCard}>
            <span className={styles.actionTitle}>Gestion de usuarios</span>
            <span className={styles.actionDesc}>Editar roles, planes y perfiles del sistema</span>
          </Link>
          <Link to="/catalog" className={styles.actionCard}>
            <span className={styles.actionTitle}>Ver catalogo</span>
            <span className={styles.actionDesc}>{AUTOMATIONS.length} automatizaciones disponibles</span>
          </Link>
        </div>
      </section>
    </>
  );
}

// ── Vista client ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  active:    'Activa',
  paused:    'Pausada',
  completed: 'Completada',
};

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'default'> = {
  active:    'success',
  paused:    'warning',
  completed: 'default',
};

function ClientDashboard() {
  const { user }                           = useAuthContext();
  const { automations, loading, error }    = useClientAutomations();

  // Dias como miembro
  const daysMember = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000)
    : 0;

  const activeCount = automations.filter((a) => a.status === 'active').length;

  return (
    <>
      <section className={styles.statsGrid} aria-label="Estadisticas personales">
        <div className={styles.statCard}>
          <span className={styles.statValue}>{activeCount}</span>
          <span className={styles.statLabel}>Automatizaciones activas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{automations.length}</span>
          <span className={styles.statLabel}>Contratadas en total</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{daysMember}</span>
          <span className={styles.statLabel}>Dias como cliente</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{AUTOMATIONS.length}</span>
          <span className={styles.statLabel}>Disponibles en catalogo</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Mis automatizaciones</h2>
          <Link to="/catalog" className={styles.seeAll}>Ver catalogo completo</Link>
        </div>

        {loading && <div className={styles.centered}><Spinner size={24} /></div>}
        {error   && <p className={styles.error} role="alert">{error}</p>}

        {!loading && !error && automations.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              Todavia no tienes automatizaciones contratadas.
            </p>
            <Link to="/catalog" className={styles.emptyAction}>
              Explorar catalogo
            </Link>
          </div>
        )}

        {!loading && automations.length > 0 && (
          <div className={styles.cardsGrid}>
            {automations.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardTop}>
                  {item.catalog && (
                    <Badge variant="accent">{item.catalog.category}</Badge>
                  )}
                  <Badge variant={STATUS_BADGE[item.status] ?? 'default'}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                </div>
                <h3 className={styles.cardTitle}>
                  {item.catalog?.title ?? item.automationId}
                </h3>
                {item.catalog && (
                  <p className={styles.cardSummary}>{item.catalog.summary}</p>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.cardDate}>
                    Activada el{' '}
                    {new Date(item.activatedAt).toLocaleDateString('es-ES')}
                  </span>
                  {item.catalog && (
                    <Link
                      to={`/catalog/${item.catalog.id}`}
                      className={styles.cardLink}
                    >
                      Ver detalle
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ── Componente raiz ───────────────────────────────────────────────────────────

export function Dashboard() {
  const { user } = useAuthContext();

  const greeting = user?.full_name
    ? `Bienvenido, ${user.full_name.split(' ')[0]}`
    : 'Panel de control';

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

      {user?.role === 'superadmin'
        ? <SuperadminDashboard />
        : <ClientDashboard />
      }
    </div>
  );
}
