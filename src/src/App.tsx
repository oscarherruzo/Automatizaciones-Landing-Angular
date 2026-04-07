/**
 * Router principal.
 * Rutas publicas:  /  /login  /register
 * Rutas privadas:  /dashboard  /catalog  /chat  /settings  /projects
 * Solo superadmin: /admin
 * Onboarding:      /onboarding (privada, sin sidebar)
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }     from '@/context/AuthContext';
import { AuthGuard }        from '@/components/guards/AuthGuard';
import { RoleGuard }        from '@/components/guards/RoleGuard';
import { DashboardLayout }  from '@/layouts/DashboardLayout/DashboardLayout';
import { Landing }          from '@/pages/Landing/Landing';
import { Login }            from '@/pages/Login/Login';
import { Register }         from '@/pages/Register/Register';
import { Onboarding }       from '@/pages/Onboarding/Onboarding';
import { Dashboard }        from '@/pages/Dashboard/Dashboard';
import { Catalog }          from '@/pages/Catalog/Catalog';
import { AutomationDetail } from '@/pages/AutomationDetail/AutomationDetail';
import { Chat }             from '@/pages/Chat/Chat';
import { Admin }            from '@/pages/Admin/Admin';
import { Settings }         from '@/pages/Settings/Settings';
import { MyProjects }       from '@/pages/MyProjects/MyProjects';
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

          {/* Onboarding — privada sin sidebar */}
          <Route element={<AuthGuard />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Rutas privadas con sidebar */}
          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/catalog"     element={<Catalog />} />
              <Route path="/catalog/:id" element={<AutomationDetail />} />
              <Route path="/chat"        element={<Chat />} />
              <Route path="/settings"    element={<Settings />} />
              <Route path="/projects"    element={<MyProjects />} />

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
