DROP POLICY IF EXISTS "Authenticated can insert assessment locks" ON public.assessment_locks;
DROP POLICY IF EXISTS "Authenticated can update assessment locks" ON public.assessment_locks;

CREATE POLICY "Admins can insert assessment locks"
ON public.assessment_locks FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update assessment locks"
ON public.assessment_locks FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT ON public.assessment_locks TO anon;
GRANT SELECT, INSERT, UPDATE ON public.assessment_locks TO authenticated;
GRANT ALL ON public.assessment_locks TO service_role;