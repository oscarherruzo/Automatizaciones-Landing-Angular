/**
 * Definicion del router principal de la aplicacion.
 *
 * Estructura de proteccion de rutas:
 *   AuthGuard       -> bloquea sin sesion, redirige a /login
 *     RoleGuard     -> bloquea por rol, redirige a /dashboard
 *       DashboardLayout -> wrapper visual con sidebar
 *         Page      -> componente de la pagina
 *
 * Las rutas de admin estan envueltas adicionalmente en RoleGuard con allowedRoles=['admin'].
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard }    from '@/components/guards/AuthGuard';
import { RoleGuard }    from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/layouts/DashboardLayout/DashboardLayout';
import { Login }            from '@/pages/Login/Login';
import { Dashboard }        from '@/pages/Dashboard/Dashboard';
import { Catalog }          from '@/pages/Catalog/Catalog';
import { AutomationDetail } from '@/pages/AutomationDetail/AutomationDetail';
import { Chat }             from '@/pages/Chat/Chat';
import { Admin }            from '@/pages/Admin/Admin';
import { Settings }         from '@/pages/Settings/Settings';
import { NotFound }         from '@/pages/NotFound/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta publica */}
          <Route path="/login" element={<Login />} />

          {/* Rutas privadas — requieren sesion activa */}
          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"      element={<Dashboard />} />
              <Route path="/catalog"        element={<Catalog />} />
              <Route path="/catalog/:id"    element={<AutomationDetail />} />
              <Route path="/chat"           element={<Chat />} />
              <Route path="/settings"       element={<Settings />} />

              {/* Rutas de administracion — requieren role='admin' */}
              <Route element={<RoleGuard allowedRoles={['admin']} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
