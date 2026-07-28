-- Migration: Grant full RLS permissions on public.ai_prompts for all roles
GRANT ALL ON public.ai_prompts TO anon, authenticated, service_role;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "admin manage prompts" ON public.ai_prompts;
  DROP POLICY IF EXISTS "public manage ai_prompts" ON public.ai_prompts;
  DROP POLICY IF EXISTS "allow_all_ai_prompts" ON public.ai_prompts;

  CREATE POLICY "allow_all_ai_prompts" ON public.ai_prompts 
    FOR ALL 
    TO anon, authenticated, service_role 
    USING (true) 
    WITH CHECK (true);
END $$;

NOTIFY pgrst, 'reload schema';
