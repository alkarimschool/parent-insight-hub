-- Migration: Ensure education_level column exists on assessments, questions, and question_categories tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'assessments'
      AND column_name = 'education_level'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN education_level TEXT NOT NULL DEFAULT 'TK';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'questions'
      AND column_name = 'education_level'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN education_level TEXT NOT NULL DEFAULT 'TK';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'question_categories'
      AND column_name = 'education_level'
  ) THEN
    ALTER TABLE public.question_categories ADD COLUMN education_level TEXT NOT NULL DEFAULT 'TK';
  END IF;
END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
