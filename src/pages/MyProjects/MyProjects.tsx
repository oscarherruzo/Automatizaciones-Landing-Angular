import { useRequests } from '@/hooks/useRequests';
import { Spinner }     from '@/components/ui/Spinner/Spinner';
import styles from './MyProjects.module.css';

type DeliveryPhase = 'analysis' | 'development' | 'testing' | 'active';

const PHASES = [
  { key: 'analysis'    as DeliveryPhase, label: 'Analisis',   desc: 'Revisando tu caso y preparando propuesta' },
  { key: 'development' as DeliveryPhase, label: 'Desarrollo', desc: 'Construyendo e integrando la automatizacion' },
  { key: 'testing'     as DeliveryPhase, label: 'Testing',    desc: 'Verificando que todo funciona correctamente' },
  { key: 'active'      as DeliveryPhase, label: 'Activo',     desc: 'Automatizacion entregada y en produccion' },
];

const PHASE_INDEX: Record<DeliveryPhase, number> = { analysis: 0, development: 1, testing: 2, active: 3 };

const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--color-warning)', contacted: 'var(--color-info)',
  in_progress: 'var(--color-accent)', completed: 'var(--color-success)', rejected: 'var(--color-error)',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', contacted: 'Contactado', in_progress: 'En curso', completed: 'Completado', rejected: 'Rechazado',
};

function ProjectCard({ automationName, status, phase, createdAt, message }: {
  automationName: string; status: string; phase: DeliveryPhase; createdAt: string; message: string;
}) {
  const currentIndex = PHASE_INDEX[phase] ?? 0;
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>{automationName}</h3>
          <span className={styles.cardDate}>Solicitado el {new Date(createdAt).toLocaleDateString('es-ES')}</span>
        </div>
        <span className={styles.statusBadge} style={{ color: STATUS_COLOR[status], borderColor: STATUS_COLOR[status] }}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>
      <div className={styles.phases}>
        {PHASES.map((p, i) => {
          const isDone = i < currentIndex; const isCurrent = i === currentIndex;
          return (
            <div key={p.key} className={styles.phase}>
              <div className={styles.phaseTrack}>
                <div className={[styles.phaseDot, isDone ? styles.phaseDotDone : '', isCurrent ? styles.phaseDotCurrent : ''].join(' ').trim()} />
                {i < PHASES.length - 1 && <div className={[styles.phaseLine, isDone ? styles.phaseLineDone : ''].join(' ').trim()} />}
              </div>
              <div className={styles.phaseInfo}>
                <span className={[styles.phaseLabel, isCurrent ? styles.phaseLabelCurrent : '', isDone ? styles.phaseLabelDone : ''].join(' ').trim()}>{p.label}</span>
                {isCurrent && <span className={styles.phaseDesc}>{p.desc}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {message && (
        <div className={styles.messageBox}>
          <span className={styles.messageLabel}>Tu solicitud</span>
          <p className={styles.messageText}>{message}</p>
        </div>
      )}
    </div>
  );
}

export function MyProjects() {
  const { requests, loading, error } = useRequests();
  const active = requests.filter((r) => r.status !== 'rejected');
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mis Proyectos</h1>
        <p className={styles.subtitle}>Estado de tus automatizaciones en curso</p>
      </header>
      {loading && <div className={styles.centered}><Spinner size={28} /></div>}
      {error   && <p className={styles.error}>{error}</p>}
      {!loading && !error && active.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No tienes proyectos activos todavia.</p>
          <a href="/catalog" className={styles.emptyAction}>Explorar automatizaciones</a>
        </div>
      )}
      {!loading && active.length > 0 && (
        <div className={styles.list}>
          {active.map((req) => (
            <ProjectCard key={req.id} automationName={req.automationName} status={req.status}
              phase={(req.delivery_phase as DeliveryPhase | undefined) ?? 'analysis'}
              createdAt={req.createdAt} message={req.message} />
          ))}
        </div>
      )}
    </div>
  );
}
