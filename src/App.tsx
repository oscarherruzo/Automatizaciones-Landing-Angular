/**
 * Router principal con lazy loading por ruta.
 * Rutas publicas:  /  /login  /register
 * Rutas privadas:  /dashboard  /catalog  /chat  /settings  /projects
 * Solo superadmin: /admin
 * Onboarding:      /onboarding (privada, sin sidebar)
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }    from '@/context/AuthContext';
import { ToastProvider }   from '@/context/ToastContext';
import { AuthGuard }       from '@/components/guards/AuthGuard';
import { RoleGuard }       from '@/components/guards/RoleGuard';
import { DashboardLayout } from '@/layouts/DashboardLayout/DashboardLayout';
import { Spinner }         from '@/components/ui/Spinner/Spinner';

/* Lazy imports — cada ruta carga su chunk solo cuando se necesita */
const Landing          = lazy(() => import('@/pages/Landing/Landing').then((m) => ({ default: m.Landing })));
const Login            = lazy(() => import('@/pages/Login/Login').then((m) => ({ default: m.Login })));
const Register         = lazy(() => import('@/pages/Register/Register').then((m) => ({ default: m.Register })));
const Onboarding       = lazy(() => import('@/pages/Onboarding/Onboarding').then((m) => ({ default: m.Onboarding })));
const Dashboard        = lazy(() => import('@/pages/Dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const Catalog          = lazy(() => import('@/pages/Catalog/Catalog').then((m) => ({ default: m.Catalog })));
const AutomationDetail = lazy(() => import('@/pages/AutomationDetail/AutomationDetail').then((m) => ({ default: m.AutomationDetail })));
const Chat             = lazy(() => import('@/pages/Chat/Chat').then((m) => ({ default: m.Chat })));
const Admin            = lazy(() => import('@/pages/Admin/Admin').then((m) => ({ default: m.Admin })));
const SettingsPage     = lazy(() => import('@/pages/Settings/Settings').then((m) => ({ default: m.Settings })));
const MyProjects       = lazy(() => import('@/pages/MyProjects/MyProjects').then((m) => ({ default: m.MyProjects })));
const NotFound         = lazy(() => import('@/pages/NotFound/NotFound').then((m) => ({ default: m.NotFound })));

/** Fallback de carga mostrado mientras se descarga el chunk de la pagina */
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Spinner size={32} />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"         element={<Landing />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<AuthGuard />}>
                <Route path="/onboarding" element={<Onboarding />} />
              </Route>

              <Route element={<AuthGuard />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard"   element={<Dashboard />} />
                  <Route path="/catalog"     element={<Catalog />} />
                  <Route path="/catalog/:id" element={<AutomationDetail />} />
                  <Route path="/chat"        element={<Chat />} />
                  <Route path="/settings"    element={<SettingsPage />} />
                  <Route path="/projects"    element={<MyProjects />} />

                  <Route element={<RoleGuard allowedRoles={['superadmin']} />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
