-- ============================================================
-- BLOQUE 3: historial de chat + fase de entrega en requests
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Columna delivery_phase en requests
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS delivery_phase TEXT
  NOT NULL DEFAULT 'analysis'
  CHECK (delivery_phase IN ('analysis', 'development', 'testing', 'active'));

-- 2. Tabla chat_history
CREATE TABLE IF NOT EXISTS public.chat_history (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content      TEXT        NOT NULL,
  tokens       INTEGER,
  session_id   UUID        NOT NULL DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_select_own"  ON public.chat_history;
DROP POLICY IF EXISTS "chat_insert_own"  ON public.chat_history;
DROP POLICY IF EXISTS "chat_delete_own"  ON public.chat_history;

CREATE POLICY "chat_select_own" ON public.chat_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "chat_insert_own" ON public.chat_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_delete_own" ON public.chat_history
  FOR DELETE USING (user_id = auth.uid());

-- 3. Tabla onboarding_data
CREATE TABLE IF NOT EXISTS public.onboarding_data (
  user_id      UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  sector       TEXT,
  company_size TEXT,
  main_need    TEXT,
  completed    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onboarding_own" ON public.onboarding_data;

CREATE POLICY "onboarding_own" ON public.onboarding_data
  FOR ALL USING (user_id = auth.uid());
