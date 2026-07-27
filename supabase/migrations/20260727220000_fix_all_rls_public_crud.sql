-- Migration: Fix Row Level Security (RLS) policies for public assessment submit flow
-- Grant explicit table privileges to anon, authenticated, and service_role
GRANT INSERT, SELECT, UPDATE, DELETE ON public.parents TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.children TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessments TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessment_answers TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.ai_results TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.questions TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.question_categories TO anon, authenticated, service_role;

-- Drop restricting policies and recreate permissive policies for public submit
DO $$
BEGIN
  -- PARENTS POLICIES
  DROP POLICY IF EXISTS "public insert parents" ON public.parents;
  CREATE POLICY "public insert parents" ON public.parents FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select parents" ON public.parents;
  CREATE POLICY "public select parents" ON public.parents FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public update parents" ON public.parents;
  CREATE POLICY "public update parents" ON public.parents FOR UPDATE TO anon, authenticated, service_role USING (true);

  -- CHILDREN POLICIES
  DROP POLICY IF EXISTS "public insert children" ON public.children;
  CREATE POLICY "public insert children" ON public.children FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select children" ON public.children;
  CREATE POLICY "public select children" ON public.children FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public update children" ON public.children;
  CREATE POLICY "public update children" ON public.children FOR UPDATE TO anon, authenticated, service_role USING (true);

  -- ASSESSMENTS POLICIES
  DROP POLICY IF EXISTS "public insert assessments" ON public.assessments;
  CREATE POLICY "public insert assessments" ON public.assessments FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select assessments" ON public.assessments;
  CREATE POLICY "public select assessments" ON public.assessments FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public update assessments" ON public.assessments;
  CREATE POLICY "public update assessments" ON public.assessments FOR UPDATE TO anon, authenticated, service_role USING (true);

  -- ASSESSMENT_ANSWERS POLICIES
  DROP POLICY IF EXISTS "public insert assessment answers" ON public.assessment_answers;
  CREATE POLICY "public insert assessment answers" ON public.assessment_answers FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select assessment answers" ON public.assessment_answers;
  CREATE POLICY "public select assessment answers" ON public.assessment_answers FOR SELECT TO anon, authenticated, service_role USING (true);

  -- AI_RESULTS POLICIES
  DROP POLICY IF EXISTS "public insert ai results" ON public.ai_results;
  CREATE POLICY "public insert ai results" ON public.ai_results FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select ai results" ON public.ai_results;
  CREATE POLICY "public select ai results" ON public.ai_results FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public update ai results" ON public.ai_results;
  CREATE POLICY "public update ai results" ON public.ai_results FOR UPDATE TO anon, authenticated, service_role USING (true);
END $$;

NOTIFY pgrst, 'reload schema';
