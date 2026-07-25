-- Migration: Add content column and data column sync for homepage_settings & website_settings
ALTER TABLE public.homepage_settings ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;

-- Ensure data column exists
ALTER TABLE public.homepage_settings ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;

-- Sync existing rows
UPDATE public.homepage_settings SET content = data WHERE (content IS NULL OR content = '{}'::jsonb) AND data IS NOT NULL;
UPDATE public.homepage_settings SET data = content WHERE (data IS NULL OR data = '{}'::jsonb) AND content IS NOT NULL;

UPDATE public.website_settings SET content = data WHERE (content IS NULL OR content = '{}'::jsonb) AND data IS NOT NULL;
UPDATE public.website_settings SET data = content WHERE (data IS NULL OR data = '{}'::jsonb) AND content IS NOT NULL;

NOTIFY pgrst, 'reload schema';
