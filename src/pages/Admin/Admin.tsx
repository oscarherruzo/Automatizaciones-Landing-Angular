/**
 * Panel de administracion — solo accesible para role='admin'.
 * La restriccion de acceso la aplica RoleGuard en el router.
 * Esta pagina no incluye logica de negocio de usuarios real:
 * en produccion conectar con Supabase para CRUD de profiles.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { Badge } from '@/components/ui/Badge/Badge';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import type { UserProfile } from '@/types';
import styles from './Admin.module.css';

export function Admin() {
  const [users,   setUsers]   = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        setError('No se pudieron cargar los usuarios.');
      } else {
        setUsers((data ?? []) as UserProfile[]);
      }
      setLoading(false);
    }

    void loadUsers();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Administracion</h1>
        <p className={styles.subtitle}>Gestion de usuarios y roles del sistema</p>
      </header>

      {loading && (
        <div className={styles.loadingState}><Spinner size={28} /></div>
      )}

      {error && !loading && (
        <p className={styles.error} role="alert">{error}</p>
      )}

      {!loading && !error && (
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
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className={styles.mono}>{u.email}</td>
                  <td>{u.full_name ?? '—'}</td>
                  <td>{u.company   ?? '—'}</td>
                  <td>
                    <Badge variant={u.role === 'admin' ? 'warning' : 'default'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={u.plan === 'free' ? 'default' : 'success'}>
                      {u.plan}
                    </Badge>
                  </td>
                  <td className={styles.mono}>
                    {new Date(u.created_at).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
