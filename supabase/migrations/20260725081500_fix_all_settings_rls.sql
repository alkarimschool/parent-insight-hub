-- Migration: Grant full RLS permissions on all settings tables for anon & authenticated roles
GRANT ALL ON public.ai_settings TO anon, authenticated, service_role;
GRANT ALL ON public.whatsapp_settings TO anon, authenticated, service_role;
GRANT ALL ON public.website_settings TO anon, authenticated, service_role;
GRANT ALL ON public.homepage_settings TO anon, authenticated, service_role;
GRANT ALL ON public.ai_prompts TO anon, authenticated, service_role;
GRANT ALL ON public.questions TO anon, authenticated, service_role;
GRANT ALL ON public.question_categories TO anon, authenticated, service_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_settings' AND policyname = 'public manage ai_settings') THEN
    CREATE POLICY "public manage ai_settings" ON public.ai_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_settings' AND policyname = 'public manage whatsapp_settings') THEN
    CREATE POLICY "public manage whatsapp_settings" ON public.whatsapp_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'website_settings' AND policyname = 'public manage website_settings') THEN
    CREATE POLICY "public manage website_settings" ON public.website_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'homepage_settings' AND policyname = 'public manage homepage_settings') THEN
    CREATE POLICY "public manage homepage_settings" ON public.homepage_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_prompts' AND policyname = 'public manage ai_prompts') THEN
    CREATE POLICY "public manage ai_prompts" ON public.ai_prompts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'public manage questions') THEN
    CREATE POLICY "public manage questions" ON public.questions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'question_categories' AND policyname = 'public manage question_categories') THEN
    CREATE POLICY "public manage question_categories" ON public.question_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
