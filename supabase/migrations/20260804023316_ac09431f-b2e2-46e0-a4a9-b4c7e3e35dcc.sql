DROP POLICY IF EXISTS "public read ai results" ON public.ai_results;
DROP POLICY IF EXISTS "public read answers" ON public.assessment_answers;
DROP POLICY IF EXISTS "public read own assessment by id" ON public.assessments;

CREATE POLICY "admin read assessments" ON public.assessments
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.assessments FROM anon;
REVOKE SELECT ON public.ai_results FROM anon;
REVOKE SELECT ON public.assessment_answers FROM anon;