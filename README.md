# Oscar Herruzo — Panel de Automatizaciones

Panel de control SaaS para gestion de automatizaciones empresariales con IA.

## Stack

- React 18 + TypeScript (strict mode)
- Vite 5
- CSS Modules
- Supabase (auth + base de datos + Edge Functions)
- Groq API via Edge Function `groq-proxy` (llama-3.3-70b-versatile)
- React Router v6

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

No se requieren permisos de administrador. Todo se instala en `node_modules/` local.
Si Node.js no esta instalado, descargalo desde https://nodejs.org (instalador sin permisos de admin disponible).

### 2. Configurar variables de entorno

```bash
copy .env.example .env.local   # Windows
cp .env.example .env.local     # Unix/Mac
```

Rellena los valores en `.env.local`:
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` — en app.supabase.com > Settings > API
- `VITE_ADMIN_EMAIL` — email del usuario que tendra rol superadmin

> **La API key de Groq NO va en `.env.local`.**
> Añadela como secret en Supabase Dashboard > Edge Functions > Secrets con el nombre `GROQ_API_KEY`.
> De esta forma nunca queda expuesta en el bundle del cliente.

### 3. Crear tabla de perfiles en Supabase

Ejecuta en el SQL Editor de tu proyecto Supabase:

```sql
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  full_name   text,
  company     text,
  role        text not null default 'client' check (role in ('superadmin', 'client')),
  plan        text not null default 'free' check (plan in ('free','pro','enterprise')),
  created_at  timestamptz default now()
);

-- RLS: cada usuario solo lee/edita su propio perfil
alter table public.profiles enable row level security;

create policy "Lectura propia" on public.profiles
  for select using (auth.uid() = id);

create policy "Edicion propia" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: crea perfil automaticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger as
$$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

También ejecuta este SQL para la tabla de onboarding (necesaria para el flujo de login):

```sql
create table if not exists public.onboarding_data (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null unique,
  completed   boolean not null default false,
  data        jsonb,
  created_at  timestamptz default now()
);

alter table public.onboarding_data enable row level security;

create policy "Lectura propia onboarding" on public.onboarding_data
  for select using (auth.uid() = user_id);

create policy "Escritura propia onboarding" on public.onboarding_data
  for insert with check (auth.uid() = user_id);

create policy "Edicion propia onboarding" on public.onboarding_data
  for update using (auth.uid() = user_id);
```

### 4. Desplegar la Edge Function

```bash
supabase functions deploy groq-proxy
```

Luego en Supabase Dashboard > Edge Functions > `groq-proxy` > Secrets, añade:

| Nombre | Valor |
|--------|-------|
| `GROQ_API_KEY` | tu clave de console.groq.com |

### 5. Crear el primer usuario superadmin

En Supabase Authentication > Users > Invite user o Add user.
Luego actualiza su rol en la tabla profiles:

```sql
update public.profiles set role = 'superadmin' where email = 'tu@email.com';
```

### 6. Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

## Estructura del proyecto

```
src/
  types/          Interfaces globales (UserProfile, Automation, ChatMessage...)
  context/        AuthContext — estado de autenticacion
  hooks/          useAuth, useAutomation, useChat
  services/       supabase.ts, groq.ts, automations.ts
  components/
    guards/       AuthGuard (sesion) + RoleGuard (RBAC)
    ui/           Button, Input, Textarea, Spinner, Badge
  layouts/        Sidebar + DashboardLayout
  pages/          Login, Dashboard, Catalog, AutomationDetail, Chat, Admin, Settings
  styles/         variables.css (tokens), globals.css
```

## Anadir una nueva automatizacion

1. Agregar el prompt en `supabase/functions/groq-proxy/index.ts` dentro de `AUTOMATION_PROMPTS`
2. Agregar la definicion en `src/services/automations.ts` dentro de `AUTOMATIONS`
3. Listo. La pagina de detalle y el catalogo se actualizan automaticamente.

## Seguridad

- XSS: todo el output de la IA se renderiza como `<pre>` con `white-space: pre-wrap`. Nunca se usa `dangerouslySetInnerHTML`.
- RBAC: `AuthGuard` bloquea sin sesion. `RoleGuard` bloquea por rol antes de renderizar.
- Tokens JWT: gestionados internamente por el SDK de Supabase. No se exponen en estado global.
- API key de Groq: reside exclusivamente en los Secrets de la Edge Function `groq-proxy`. Nunca se incluye en el bundle del cliente.
