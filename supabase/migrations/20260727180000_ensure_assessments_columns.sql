-- Migration: Ensure assessments table has education_level, assessment_title, prompt_id, ai_prompt, ai_result & ensure public RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assessments'
      AND column_name = 'education_level'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN education_level TEXT NOT NULL DEFAULT 'TK';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assessments'
      AND column_name = 'assessment_title'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN assessment_title TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assessments'
      AND column_name = 'prompt_id'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN prompt_id UUID REFERENCES public.ai_prompts(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assessments'
      AND column_name = 'ai_prompt'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN ai_prompt TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assessments'
      AND column_name = 'ai_result'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN ai_result JSONB;
  END IF;
END $$;

-- Enable RLS and Grant full permissions for public submission flow
GRANT INSERT, SELECT, UPDATE, DELETE ON public.ai_results TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessments TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.parents TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.children TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessment_answers TO anon, authenticated, service_role;

-- Drop restricting policies if present and recreate permissive policies for public submit
DO $$
BEGIN
  -- ai_results policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_results' AND policyname = 'public insert ai results') THEN
    CREATE POLICY "public insert ai results" ON public.ai_results FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_results' AND policyname = 'public update ai results') THEN
    CREATE POLICY "public update ai results" ON public.ai_results FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  -- assessments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'public update own assessment') THEN
    CREATE POLICY "public update own assessment" ON public.assessments FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'public insert assessment') THEN
    CREATE POLICY "public insert assessment" ON public.assessments FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  -- parents policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'public update parents') THEN
    CREATE POLICY "public update parents" ON public.parents FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'public select parents') THEN
    CREATE POLICY "public select parents" ON public.parents FOR SELECT TO anon, authenticated USING (true);
  END IF;

  -- children policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'public select children') THEN
    CREATE POLICY "public select children" ON public.children FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
