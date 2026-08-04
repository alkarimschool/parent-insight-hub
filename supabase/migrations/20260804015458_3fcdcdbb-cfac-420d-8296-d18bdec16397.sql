CREATE TABLE public.assessment_locks (
  education_level TEXT PRIMARY KEY,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.assessment_locks TO anon;
GRANT SELECT, INSERT, UPDATE ON public.assessment_locks TO authenticated;
GRANT ALL ON public.assessment_locks TO service_role;

ALTER TABLE public.assessment_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assessment locks" ON public.assessment_locks FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert assessment locks" ON public.assessment_locks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update assessment locks" ON public.assessment_locks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_assessment_locks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_assessment_locks_updated_at BEFORE UPDATE ON public.assessment_locks FOR EACH ROW EXECUTE FUNCTION public.set_assessment_locks_updated_at();

INSERT INTO public.assessment_locks (education_level, is_locked) VALUES
  ('TK', true), ('SD', true), ('SMP', true), ('SMA', false), ('SMK', false);