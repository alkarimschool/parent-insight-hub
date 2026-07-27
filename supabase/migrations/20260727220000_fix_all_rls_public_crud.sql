-- Migration: Ensure complete INSERT, SELECT, UPDATE, DELETE RLS policies for public assessment submit flow
GRANT INSERT, SELECT, UPDATE, DELETE ON public.parents TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.children TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessments TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessment_answers TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.ai_results TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.questions TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.question_categories TO anon, authenticated, service_role;

-- Ensure RLS is enabled and recreate permissive policies
DO $$
BEGIN
  -- PARENTS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'public insert parents') THEN
    CREATE POLICY "public insert parents" ON public.parents FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'public select parents') THEN
    CREATE POLICY "public select parents" ON public.parents FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'public update parents') THEN
    CREATE POLICY "public update parents" ON public.parents FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  -- CHILDREN POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'public insert children') THEN
    CREATE POLICY "public insert children" ON public.children FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'public select children') THEN
    CREATE POLICY "public select children" ON public.children FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'public update children') THEN
    CREATE POLICY "public update children" ON public.children FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  -- ASSESSMENTS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'public insert assessments') THEN
    CREATE POLICY "public insert assessments" ON public.assessments FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'public select assessments') THEN
    CREATE POLICY "public select assessments" ON public.assessments FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'public update assessments') THEN
    CREATE POLICY "public update assessments" ON public.assessments FOR UPDATE TO anon, authenticated USING (true);
  END IF;

  -- ASSESSMENT_ANSWERS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessment_answers' AND policyname = 'public insert assessment answers') THEN
    CREATE POLICY "public insert assessment answers" ON public.assessment_answers FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessment_answers' AND policyname = 'public select assessment answers') THEN
    CREATE POLICY "public select assessment answers" ON public.assessment_answers FOR SELECT TO anon, authenticated USING (true);
  END IF;

  -- AI_RESULTS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_results' AND policyname = 'public insert ai results') THEN
    CREATE POLICY "public insert ai results" ON public.ai_results FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_results' AND policyname = 'public select ai results') THEN
    CREATE POLICY "public select ai results" ON public.ai_results FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_results' AND policyname = 'public update ai results') THEN
    CREATE POLICY "public update ai results" ON public.ai_results FOR UPDATE TO anon, authenticated USING (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
