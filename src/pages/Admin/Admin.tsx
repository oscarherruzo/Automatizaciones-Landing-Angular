/**
 * Panel de administracion — solo accesible para role='superadmin'.
 * Secciones:
 *   1. Estadisticas de plataforma
 *   2. Solicitudes de implementacion (con cambio de estado inline)
 *   3. Gestion de usuarios (rol y plan editables inline)
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase }          from '@/services/supabase';
import { Spinner }           from '@/components/ui/Spinner/Spinner';
import { useAdminStats }     from '@/hooks/useAdminStats';
import { useRequests }       from '@/hooks/useRequests';
import type { RequestStatus } from '@/hooks/useRequests';
import type { UserProfile, UserRole } from '@/types';
import styles from './Admin.module.css';

type Plan = 'free' | 'pro' | 'enterprise';

function RoleCell({ userId, current, onUpdate }: {
  userId: string; current: UserRole; onUpdate: (id: string, role: UserRole) => void;
}) {
  const [saving, setSaving] = useState(false);
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as UserRole;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ role: next }).eq('id', userId);
    setSaving(false);
    if (!error) onUpdate(userId, next);
  }
  return (
    <div className={styles.inlineCell}>
      <select className={styles.inlineSelect} value={current} onChange={handleChange} disabled={saving} aria-label="Cambiar rol">
        <option value="client">client</option>
        <option value="superadmin">superadmin</option>
      </select>
      {saving && <Spinner size={14} />}
    </div>
  );
}

function PlanCell({ userId, current, onUpdate }: {
  userId: string; current: Plan; onUpdate: (id: string, plan: Plan) => void;
}) {
  const [saving, setSaving] = useState(false);
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Plan;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ plan: next }).eq('id', userId);
    setSaving(false);
    if (!error) onUpdate(userId, next);
  }
  return (
    <div className={styles.inlineCell}>
      <select className={styles.inlineSelect} value={current} onChange={handleChange} disabled={saving} aria-label="Cambiar plan">
        <option value="free">free</option>
        <option value="pro">pro</option>
        <option value="enterprise">enterprise</option>
      </select>
      {saving && <Spinner size={14} />}
    </div>
  );
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending:     'Pendiente',
  contacted:   'Contactado',
  in_progress: 'En curso',
  completed:   'Completada',
  rejected:    'Rechazada',
};

function RequestStatusCell({ id, current, onUpdate }: {
  id: string; current: RequestStatus; onUpdate: (id: string, status: RequestStatus) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as RequestStatus;
    setSaving(true);
    await onUpdate(id, next);
    setSaving(false);
  }
  return (
    <div className={styles.inlineCell}>
      <select className={styles.inlineSelect} value={current} onChange={handleChange} disabled={saving} aria-label="Cambiar estado">
        {(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      {saving && <Spinner size={14} />}
    </div>
  );
}

export function Admin() {
  const [users,         setUsers]         = useState<UserProfile[]>([]);
  const [loadingUsers,  setLoadingUsers]  = useState(true);
  const [usersError,    setUsersError]    = useState<string | null>(null);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { stats, loading: statsLoading } = useAdminStats();
  const { requests, loading: reqLoading, error: reqError, updateStatus } = useRequests();

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data) { setUsersError('No se pudieron cargar los usuarios.'); }
    else { setUsers(data as UserProfile[]); setUsersError(null); }
    setLoadingUsers(false);
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  function handleRoleUpdate(id: string, role: UserRole) { setUsers((p) => p.map((u) => u.id === id ? { ...u, role } : u)); }
  function handlePlanUpdate(id: string, plan: Plan)     { setUsers((p) => p.map((u) => u.id === id ? { ...u, plan } : u)); }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) setUsers((p) => p.filter((u) => u.id !== id));
    setDeletingId(null);
    setConfirmDelete(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Administracion</h1>
        <p className={styles.subtitle}>Gestion de usuarios, solicitudes y roles del sistema</p>
      </header>

      {!statsLoading && stats && (
        <section className={styles.statsGrid} aria-label="Estadisticas">
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.totalUsers}</span>
            <span className={styles.statLabel}>Usuarios totales</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.newThisWeek}</span>
            <span className={styles.statLabel}>Nuevos esta semana</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{pendingCount}</span>
            <span className={styles.statLabel}>Solicitudes pendientes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.byPlan.pro + stats.byPlan.enterprise}</span>
            <span className={styles.statLabel}>Clientes de pago</span>
          </div>
        </section>
      )}

      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>
          Solicitudes de implementacion
          {pendingCount > 0 && <span className={styles.pendingBadge}>{pendingCount} pendientes</span>}
        </h2>
        {reqLoading && <div className={styles.loadingState}><Spinner size={24} /></div>}
        {reqError   && <p className={styles.error}>{reqError}</p>}
        {!reqLoading && !reqError && requests.length === 0 && (
          <p className={styles.emptyText}>No hay solicitudes todavia.</p>
        )}
        {!reqLoading && requests.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Automatizacion</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Empresa</th>
                  <th>Mensaje</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td><span className={styles.automationName}>{req.automationName}</span></td>
                    <td>{req.fullName}</td>
                    <td className={styles.mono}>{req.email}</td>
                    <td>{req.company ?? '—'}</td>
                    <td className={styles.messageCell} title={req.message}>
                      {req.message.length > 60 ? req.message.slice(0, 60) + '...' : req.message}
                    </td>
                    <td>
                      <RequestStatusCell id={req.id} current={req.status} onUpdate={updateStatus} />
                    </td>
                    <td className={styles.mono}>
                      {new Date(req.createdAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.sectionBlock}>
        <h2 className={styles.sectionTitle}>Usuarios</h2>
        {loadingUsers && <div className={styles.loadingState}><Spinner size={24} /></div>}
        {usersError && !loadingUsers && <p className={styles.error}>{usersError}</p>}
        {!loadingUsers && !usersError && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Empresa</th>
                  <th>Rol</th>
                  <th>Plan</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.mono}>{u.email}</td>
                    <td>{u.full_name ?? '—'}</td>
                    <td>{u.company   ?? '—'}</td>
                    <td><RoleCell userId={u.id} current={u.role} onUpdate={handleRoleUpdate} /></td>
                    <td><PlanCell userId={u.id} current={u.plan as Plan} onUpdate={handlePlanUpdate} /></td>
                    <td className={styles.mono}>{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                    <td>
                      {confirmDelete === u.id ? (
                        <div className={styles.confirmRow}>
                          <button className={styles.btnDanger} onClick={() => void handleDelete(u.id)} disabled={deletingId === u.id}>
                            {deletingId === u.id ? <Spinner size={14} /> : 'Confirmar'}
                          </button>
                          <button className={styles.btnGhost} onClick={() => setConfirmDelete(null)}>Cancelar</button>
                        </div>
                      ) : (
                        <button className={styles.btnGhost} onClick={() => setConfirmDelete(u.id)}>Eliminar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className={styles.footnote}>
          Eliminar un perfil borra los datos de profiles. Para revocar acceso completo elimina el usuario en Supabase Dashboard &gt; Authentication &gt; Users.
        </p>
      </section>
    </div>
  );
}