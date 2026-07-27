-- Migration: Production RLS Security Policies for Public Assessment Flow
-- Enables RLS on all assessment tables and grants explicit public INSERT, SELECT, UPDATE access

-- 1. Grant table-level permissions to anon, authenticated, and service_role
GRANT INSERT, SELECT, UPDATE, DELETE ON public.parents TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.children TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessments TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessment_answers TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.ai_results TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.questions TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.question_categories TO anon, authenticated, service_role;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.ai_prompts TO anon, authenticated, service_role;

-- 2. Ensure RLS is enabled on all core tables (DO NOT DISABLE RLS)
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_results ENABLE ROW LEVEL SECURITY;

-- 3. Create permissive RLS policies for public assessment submit & admin reads
DO $$
BEGIN
  -- PARENTS POLICIES
  DROP POLICY IF EXISTS "public insert parents" ON public.parents;
  DROP POLICY IF EXISTS "allow_public_insert_parents" ON public.parents;
  CREATE POLICY "allow_public_insert_parents" ON public.parents FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select parents" ON public.parents;
  DROP POLICY IF EXISTS "allow_public_select_parents" ON public.parents;
  CREATE POLICY "allow_public_select_parents" ON public.parents FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public update parents" ON public.parents;
  DROP POLICY IF EXISTS "allow_public_update_parents" ON public.parents;
  CREATE POLICY "allow_public_update_parents" ON public.parents FOR UPDATE TO anon, authenticated, service_role USING (true);

  -- CHILDREN POLICIES
  DROP POLICY IF EXISTS "public insert children" ON public.children;
  DROP POLICY IF EXISTS "allow_public_insert_children" ON public.children;
  CREATE POLICY "allow_public_insert_children" ON public.children FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select children" ON public.children;
  DROP POLICY IF EXISTS "allow_public_select_children" ON public.children;
  CREATE POLICY "allow_public_select_children" ON public.children FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public update children" ON public.children;
  DROP POLICY IF EXISTS "allow_public_update_children" ON public.children;
  CREATE POLICY "allow_public_update_children" ON public.children FOR UPDATE TO anon, authenticated, service_role USING (true);

  -- ASSESSMENTS POLICIES
  DROP POLICY IF EXISTS "public insert assessments" ON public.assessments;
  DROP POLICY IF EXISTS "allow_public_insert_assessments" ON public.assessments;
  CREATE POLICY "allow_public_insert_assessments" ON public.assessments FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select assessments" ON public.assessments;
  DROP POLICY IF EXISTS "allow_public_select_assessments" ON public.assessments;
  CREATE POLICY "allow_public_select_assessments" ON public.assessments FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public update assessments" ON public.assessments;
  DROP POLICY IF EXISTS "allow_public_update_assessments" ON public.assessments;
  CREATE POLICY "allow_public_update_assessments" ON public.assessments FOR UPDATE TO anon, authenticated, service_role USING (true);

  -- ASSESSMENT_ANSWERS POLICIES
  DROP POLICY IF EXISTS "public insert assessment answers" ON public.assessment_answers;
  DROP POLICY IF EXISTS "allow_public_insert_assessment_answers" ON public.assessment_answers;
  CREATE POLICY "allow_public_insert_assessment_answers" ON public.assessment_answers FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select assessment answers" ON public.assessment_answers;
  DROP POLICY IF EXISTS "allow_public_select_assessment_answers" ON public.assessment_answers;
  CREATE POLICY "allow_public_select_assessment_answers" ON public.assessment_answers FOR SELECT TO anon, authenticated, service_role USING (true);

  -- AI_RESULTS POLICIES
  DROP POLICY IF EXISTS "public insert ai results" ON public.ai_results;
  DROP POLICY IF EXISTS "allow_public_insert_ai_results" ON public.ai_results;
  CREATE POLICY "allow_public_insert_ai_results" ON public.ai_results FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

  DROP POLICY IF EXISTS "public select ai results" ON public.ai_results;
  DROP POLICY IF EXISTS "allow_public_select_ai_results" ON public.ai_results;
  CREATE POLICY "allow_public_select_ai_results" ON public.ai_results FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public update ai results" ON public.ai_results;
  DROP POLICY IF EXISTS "allow_public_update_ai_results" ON public.ai_results;
  CREATE POLICY "allow_public_update_ai_results" ON public.ai_results FOR UPDATE TO anon, authenticated, service_role USING (true);
END $$;

-- Notify PostgREST engine to reload schema cache and active RLS policies
NOTIFY pgrst, 'reload schema';
