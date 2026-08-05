GRANT SELECT ON public.assessment_locks TO anon;
GRANT SELECT, INSERT, UPDATE ON public.assessment_locks TO authenticated;
GRANT ALL ON public.assessment_locks TO service_role;