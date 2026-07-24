-- Migration: Allow SELECT, INSERT, UPDATE, DELETE policies on parents, children, and assessments for anon and authenticated roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'public select parents'
  ) THEN
    CREATE POLICY "public select parents" ON public.parents FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'public update parents'
  ) THEN
    CREATE POLICY "public update parents" ON public.parents FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'public delete parents'
  ) THEN
    CREATE POLICY "public delete parents" ON public.parents FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'public select children'
  ) THEN
    CREATE POLICY "public select children" ON public.children FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'public update children'
  ) THEN
    CREATE POLICY "public update children" ON public.children FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'public delete children'
  ) THEN
    CREATE POLICY "public delete children" ON public.children FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'public select assessments'
  ) THEN
    CREATE POLICY "public select assessments" ON public.assessments FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'public update assessments'
  ) THEN
    CREATE POLICY "public update assessments" ON public.assessments FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'public delete assessments'
  ) THEN
    CREATE POLICY "public delete assessments" ON public.assessments FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
