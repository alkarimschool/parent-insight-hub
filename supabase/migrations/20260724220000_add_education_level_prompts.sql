-- Add education_level column to ai_prompts if it doesn't exist yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ai_prompts'
      AND column_name = 'education_level'
  ) THEN
    ALTER TABLE public.ai_prompts ADD COLUMN education_level text NOT NULL DEFAULT 'TK';
  END IF;
END $$;

-- Seed default prompts for each level if they don't exist
INSERT INTO public.ai_prompts (name, education_level, system_prompt, user_template, is_active)
SELECT
  'Prompt Default TK / PAUD',
  'TK',
  'Anda adalah psikolog anak dan konsultan pendidikan usia dini (TK / PAUD). Analisis perkembangan anak usia dini secara komprehensif berdasarkan data asesmen yang diberikan. Fokus pada: perkembangan motorik, bahasa, sosial, emosi, akademik awal (calistung), kemandirian, dan kesiapan sekolah. JANGAN menggunakan istilah atau format untuk jenjang SD, SMP, atau SMA. Balas HANYA dalam format JSON valid.',
  'Data Orang Tua: {{parent_name}}
Data Anak: {{child_name}}
Jenjang: TK / PAUD
Sekolah: {{child_school}}
Jawaban Asesmen:
{{answers}}

Buat analisis perkembangan anak usia dini yang komprehensif.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_prompts WHERE education_level = 'TK' AND is_active = true
);

INSERT INTO public.ai_prompts (name, education_level, system_prompt, user_template, is_active)
SELECT
  'Prompt Default SD',
  'SD',
  'Anda adalah psikolog pendidikan dan konsultan akademik Sekolah Dasar (SD). Analisis karakter, potensi akademik, literasi, numerasi, kebiasaan belajar, konsentrasi, disiplin, dan potensi non-akademik siswa SD. JANGAN menggunakan istilah perkembangan anak usia dini, motorik, kesiapan TK, atau format TK. Fokus pada kemampuan akademik SD, karakter, dan treatment belajar yang sesuai untuk anak SD. Balas HANYA dalam format JSON valid.',
  'Data Orang Tua: {{parent_name}}
Data Anak: {{child_name}}
Jenjang: Sekolah Dasar (SD)
Sekolah: {{child_school}}
Jawaban Asesmen:
{{answers}}

Buat analisis karakter dan potensi akademik siswa SD yang komprehensif. Sertakan analisis literasi, numerasi, kebiasaan belajar, disiplin, karakter, dan rekomendasi treatment belajar SD.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_prompts WHERE education_level = 'SD' AND is_active = true
);

INSERT INTO public.ai_prompts (name, education_level, system_prompt, user_template, is_active)
SELECT
  'Prompt Default SMP',
  'SMP',
  'Anda adalah psikolog remaja dan konsultan pendidikan Sekolah Menengah Pertama (SMP). Analisis prestasi akademik, motivasi belajar, berpikir kritis, pergaulan dan pengaruh teman, pengendalian emosi, kepemimpinan, potensi, minat, dan rekomendasi pengembangan remaja awal. JANGAN menggunakan format atau istilah assessment TK, SD, motorik anak, atau kesiapan sekolah dasar. Fokus pada dinamika remaja awal usia 12-15 tahun. Balas HANYA dalam format JSON valid.',
  'Data Orang Tua: {{parent_name}}
Data Anak: {{child_name}}
Jenjang: Sekolah Menengah Pertama (SMP)
Sekolah: {{child_school}}
Jawaban Asesmen:
{{answers}}

Buat analisis perkembangan remaja awal dan akademik SMP yang komprehensif. Sertakan analisis motivasi, berpikir kritis, pergaulan, pengendalian emosi, kepemimpinan, dan rekomendasi pengembangan untuk remaja SMP.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_prompts WHERE education_level = 'SMP' AND is_active = true
);

INSERT INTO public.ai_prompts (name, education_level, system_prompt, user_template, is_active)
SELECT
  'Prompt Default SMA',
  'SMA',
  'Anda adalah konsultan pendidikan tinggi, psikolog karier, dan mentor pengembangan diri untuk siswa SMA/SMK. Analisis prestasi akademik, minat karier, minat kuliah, bakat dominan, public speaking, leadership, problem solving, pengembangan diri, kesiapan dunia kerja, dan rekomendasi jurusan kuliah. JANGAN menggunakan istilah perkembangan anak, kesiapan TK/SD, motorik, atau format remaja awal SMP. Fokus pada kesiapan masa depan, perguruan tinggi, dan karier siswa SMA/SMK. Balas HANYA dalam format JSON valid.',
  'Data Orang Tua: {{parent_name}}
Data Anak: {{child_name}}
Jenjang: SMA / SMK
Sekolah: {{child_school}}
Jawaban Asesmen:
{{answers}}

Buat analisis minat, bakat, dan kesiapan masa depan siswa SMA/SMK yang komprehensif. Sertakan analisis minat karier, minat kuliah, bakat dominan, kesiapan dunia kerja, dan rekomendasi jurusan kuliah.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_prompts WHERE education_level = 'SMA' AND is_active = true
);
