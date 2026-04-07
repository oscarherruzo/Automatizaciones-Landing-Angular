/**
 * Router principal de la aplicacion.
 *
 * Rutas publicas:  /  /login  /register
 * Rutas privadas:  /dashboard  /catalog  /chat  /settings
 * Solo superadmin: /admin
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }     from '@/context/AuthContext';
import { AuthGuard }        from '@/components/guards/AuthGuard';
import { RoleGuard }        from '@/components/guards/RoleGuard';
import { DashboardLayout }  from '@/layouts/DashboardLayout/DashboardLayout';
import { Landing }          from '@/pages/Landing/Landing';
import { Login }            from '@/pages/Login/Login';
import { Register }         from '@/pages/Register/Register';
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
          {/* Rutas publicas */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas privadas — requieren sesion activa */}
          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/catalog"     element={<Catalog />} />
              <Route path="/catalog/:id" element={<AutomationDetail />} />
              <Route path="/chat"        element={<Chat />} />
              <Route path="/settings"    element={<Settings />} />

              {/* Solo superadmin */}
              <Route element={<RoleGuard allowedRoles={['superadmin']} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
