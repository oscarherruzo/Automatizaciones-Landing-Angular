/**
 * Dashboard principal.
 *
 * Vista superadmin: metricas de plataforma, acciones rápidas y solicitudes recientes.
 * Vista client:     automatizaciones contratadas, estadísticas y chats recientes.
 */
import { Link }                    from 'react-router-dom';
import { useAuthContext }           from '@/context/AuthContext';
import { useAdminStats }            from '@/hooks/useAdminStats';
import { useClientAutomations }     from '@/hooks/useClientAutomations';
import { AUTOMATIONS }              from '@/services/automations';
import { Badge }                    from '@/components/ui/Badge/Badge';
import { Spinner }                  from '@/components/ui/Spinner/Spinner';
import { useEffect, useState }      from 'react'; // Añadido para los chats/requests
import { supabase }                 from '@/services/supabase'; // Añadido
import styles from './Dashboard.module.css';

// ── Vista superadmin ──────────────────────────────────────────────────────────

function SuperadminDashboard() {
  const { stats, loading, error } = useAdminStats();
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  // Traer las solicitudes recientes
  useEffect(() => {
    async function fetchRequests() {
      const { data } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setRecentRequests(data);
    }
    fetchRequests();
  }, []);

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

      {/* NUEVA SECCIÓN: Solicitudes Recientes */}
      <section className={styles.section} style={{ marginTop: '2rem' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Últimas solicitudes</h2>
          <Link to="/admin" className={styles.seeAll}>Ver todas</Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No hay solicitudes nuevas.</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {recentRequests.map(req => (
              <div key={req.id} className={styles.card}>
                 <div className={styles.cardTop}>
                    <strong>{req.full_name}</strong>
                    <Badge variant="accent">{new Date(req.created_at).toLocaleDateString()}</Badge>
                  </div>
                  <h3 className={styles.cardTitle} style={{marginTop: '0.5rem'}}>{req.automation_name}</h3>
                  <p className={styles.cardSummary}>{req.email}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section} style={{ marginTop: '2rem' }}>
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
  const [recentChats, setRecentChats]      = useState<any[]>([]);

  // Dias como miembro
  const daysMember = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000)
    : 0;

  const activeCount = automations.filter((a) => a.status === 'active').length;

  // Traer los últimos chats
  useEffect(() => {
    async function fetchChats() {
      if(!user?.id) return;
      // Ajusta 'chat_history' al nombre real de tu tabla si es otro
      const { data } = await supabase
        .from('chat_history') 
        .select('content, created_at')
        .eq('user_id', user.id)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(2);
      if (data) setRecentChats(data);
    }
    fetchChats();
  }, [user?.id]);

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

      {/* Layout a dos columnas: Mis automatizaciones | Chats recientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        <section className={styles.section} style={{ margin: 0 }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Mis automatizaciones</h2>
            <Link to="/catalog" className={styles.seeAll}>Ver catalogo</Link>
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
            <div className={styles.cardsGrid} style={{ display: 'flex', flexDirection: 'column' }}>
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
                      Activada el {new Date(item.activatedAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NUEVA SECCIÓN: Chats recientes */}
        <section className={styles.section} style={{ margin: 0 }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Asistente IA</h2>
            <Link to="/chat" className={styles.seeAll}>Abrir chat</Link>
          </div>
          
          <div className={styles.cardsGrid} style={{ display: 'flex', flexDirection: 'column' }}>
            {recentChats.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No has realizado ninguna consulta todavía.</p>
                <Link to="/chat" className={styles.emptyAction}>Empezar chat</Link>
              </div>
            ) : (
              <>
                {recentChats.map((chat, idx) => (
                  <div key={idx} className={styles.card} style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)', borderLeft: '4px solid var(--primary-color, #3b82f6)' }}>
                    <p className={styles.cardSummary} style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      "{chat.content.length > 60 ? chat.content.substring(0, 60) + '...' : chat.content}"
                    </p>
                    <span className={styles.cardDate} style={{ fontSize: '0.75rem' }}>
                      {new Date(chat.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                <Link to="/chat" className={styles.actionCard} style={{ textAlign: 'center', display: 'block', padding: '0.75rem' }}>
                  <span className={styles.actionTitle} style={{ margin: 0, fontSize: '0.9rem' }}>+ Nueva consulta</span>
                </Link>
              </>
            )}
          </div>
        </section>

      </div>
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