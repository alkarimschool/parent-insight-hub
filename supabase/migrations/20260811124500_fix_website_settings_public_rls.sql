-- Migration: Allow public select read on website_settings table for public assessment homepage
GRANT SELECT ON public.website_settings TO anon, authenticated, service_role;
GRANT SELECT ON public.assessment_locks TO anon, authenticated, service_role;

DO $$
BEGIN
  DROP POLICY IF EXISTS "public read website_settings" ON public.website_settings;
  CREATE POLICY "public read website_settings" ON public.website_settings FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public select website_settings" ON public.website_settings;
  CREATE POLICY "public select website_settings" ON public.website_settings FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public read website" ON public.website_settings;
  CREATE POLICY "public read website" ON public.website_settings FOR SELECT TO anon, authenticated, service_role USING (true);

  DROP POLICY IF EXISTS "public select assessment_locks" ON public.assessment_locks;
  CREATE POLICY "public select assessment_locks" ON public.assessment_locks FOR SELECT TO anon, authenticated, service_role USING (true);
END $$;

NOTIFY pgrst, 'reload schema';
