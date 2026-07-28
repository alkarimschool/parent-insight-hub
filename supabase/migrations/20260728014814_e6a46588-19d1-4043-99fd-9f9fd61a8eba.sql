ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT 'TK',
  ADD COLUMN IF NOT EXISTS assessment_title text,
  ADD COLUMN IF NOT EXISTS ai_prompt text;

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT 'TK';

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT 'TK';

ALTER TABLE public.question_categories
  ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT 'TK';

ALTER TABLE public.ai_prompts
  ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT 'TK';

CREATE INDEX IF NOT EXISTS idx_assessments_education_level ON public.assessments(education_level);
CREATE INDEX IF NOT EXISTS idx_questions_education_level ON public.questions(education_level);

UPDATE public.assessments a
SET education_level = upper(coalesce(
      r.content->>'shortName',
      r.content->>'education_level',
      r.content->>'level'
    )),
    assessment_title = coalesce(a.assessment_title, r.content->>'reportTitle')
FROM public.ai_results r
WHERE r.assessment_id = a.id
  AND upper(coalesce(r.content->>'shortName', r.content->>'education_level', r.content->>'level','')) IN ('TK','SD','SMP','SMA','SMK');

UPDATE public.children c
SET education_level = a.education_level
FROM public.assessments a
WHERE a.child_id = c.id
  AND a.education_level IN ('TK','SD','SMP','SMA','SMK');