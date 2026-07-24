
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- First registered user becomes admin automatically
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count int;
BEGIN
  SELECT count(*) INTO user_count FROM public.user_roles WHERE role = 'admin';
  IF user_count = 0 THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- ============ HELPER updated_at ============
CREATE OR REPLACE FUNCTION public.tg_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ CATEGORIES + QUESTIONS ============
CREATE TABLE public.question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.question_categories TO anon, authenticated;
GRANT ALL ON public.question_categories TO service_role;
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.question_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage categories" ON public.question_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.question_categories(id) ON DELETE SET NULL,
  text text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT ALL ON public.questions TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.questions TO authenticated;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active questions" ON public.questions FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage questions" ON public.questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_questions_updated BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- ============ PARENTS + CHILDREN ============
CREATE TABLE public.parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT, SELECT, UPDATE, DELETE ON public.parents TO anon, authenticated;
GRANT ALL ON public.parents TO service_role;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert parents" ON public.parents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read parents" ON public.parents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update parents" ON public.parents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete parents" ON public.parents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('L','P')),
  birth_date date NOT NULL,
  school text,
  class_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT, SELECT, UPDATE, DELETE ON public.children TO anon, authenticated;
GRANT ALL ON public.children TO service_role;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert children" ON public.children FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read children" ON public.children FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update children" ON public.children FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete children" ON public.children FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ ASSESSMENTS + ANSWERS ============
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','analyzing','analyzed','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessments TO anon, authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert assessments" ON public.assessments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public read own assessment by id" ON public.assessments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin update assessments" ON public.assessments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete assessments" ON public.assessments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_assessments_updated BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

CREATE TABLE public.assessment_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  score int NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);
GRANT INSERT, SELECT, UPDATE, DELETE ON public.assessment_answers TO anon, authenticated;
GRANT ALL ON public.assessment_answers TO service_role;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert answers" ON public.assessment_answers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public read answers" ON public.assessment_answers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage answers" ON public.assessment_answers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ AI PROMPTS + RESULTS + SETTINGS ============
CREATE TABLE public.ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  system_prompt text NOT NULL,
  user_template text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_prompts TO authenticated;
GRANT ALL ON public.ai_prompts TO service_role;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage prompts" ON public.ai_prompts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tg_ai_prompts_updated BEFORE UPDATE ON public.ai_prompts FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

CREATE TABLE public.ai_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL UNIQUE REFERENCES public.assessments(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  raw_text text,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT, SELECT, UPDATE, DELETE ON public.ai_results TO anon, authenticated;
GRANT ALL ON public.ai_results TO service_role;
ALTER TABLE public.ai_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read ai results" ON public.ai_results FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage ai results" ON public.ai_results FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL DEFAULT 'google/gemini-3.6-flash',
  temperature numeric NOT NULL DEFAULT 0.7,
  max_tokens int NOT NULL DEFAULT 4096,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_settings TO authenticated;
GRANT ALL ON public.ai_settings TO service_role;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage ai settings" ON public.ai_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ WHATSAPP ============
CREATE TABLE public.whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_url text,
  api_token text,
  sender text,
  template text,
  is_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.whatsapp_settings TO service_role;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage whatsapp" ON public.whatsapp_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SITE + HOMEPAGE SETTINGS ============
CREATE TABLE public.website_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.website_settings TO anon, authenticated;
GRANT ALL ON public.website_settings TO service_role;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read website" ON public.website_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage website" ON public.website_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.homepage_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.homepage_settings TO anon, authenticated;
GRANT ALL ON public.homepage_settings TO service_role;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read homepage" ON public.homepage_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage homepage" ON public.homepage_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ACTIVITY LOGS ============
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  entity_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SEED DATA ============
INSERT INTO public.question_categories (name, slug, order_index) VALUES
  ('Komunikasi', 'komunikasi', 1),
  ('Sosial dan Emosional', 'sosial', 2),
  ('Kemandirian', 'kemandirian', 3),
  ('Belajar dan Konsentrasi', 'belajar', 4),
  ('Perilaku dan Potensi', 'perilaku', 5);

INSERT INTO public.questions (category_id, text, order_index)
SELECT c.id, q.text, q.ord FROM (VALUES
  ('komunikasi', 'Apakah anak mampu menyampaikan keinginan, pendapat, atau perasaannya dengan jelas kepada orang lain?', 1),
  ('komunikasi', 'Ketika diberikan arahan sederhana, apakah anak dapat memahami dan melakukannya dengan baik?', 2),
  ('komunikasi', 'Apakah anak berani bertanya, menjawab pertanyaan, atau bercerita kepada orang lain?', 3),
  ('sosial', 'Apakah anak mudah bermain dan bergaul dengan teman-teman seusianya?', 4),
  ('sosial', 'Saat menghadapi kekecewaan, apakah anak mampu mengendalikan emosinya tanpa marah atau menangis berlebihan?', 5),
  ('sosial', 'Apakah anak menunjukkan rasa peduli, seperti membantu atau menghibur orang lain yang sedang sedih atau kesulitan?', 6),
  ('kemandirian', 'Apakah anak mampu melakukan kegiatan sehari-hari seperti makan, memakai pakaian, atau merapikan mainan secara mandiri?', 7),
  ('kemandirian', 'Apakah anak terbiasa menjaga dan merapikan barang-barang miliknya setelah digunakan?', 8),
  ('kemandirian', 'Apakah anak berani mencoba aktivitas atau pengalaman baru tanpa harus selalu didampingi orang tua?', 9),
  ('belajar', 'Apakah anak mampu berkonsentrasi mengikuti kegiatan atau bermain selama sekitar 10–15 menit?', 10),
  ('belajar', 'Apakah anak sering menunjukkan rasa ingin tahu dengan bertanya atau mencoba hal-hal baru?', 11),
  ('belajar', 'Apakah anak tetap berusaha menyelesaikan tugas atau permainan meskipun mengalami kesulitan?', 12),
  ('perilaku', 'Apakah anak mampu mengikuti aturan yang berlaku di rumah maupun di sekolah tanpa harus selalu diingatkan?', 13),
  ('perilaku', 'Apakah anak sering menunjukkan ketertarikan yang kuat terhadap aktivitas tertentu, seperti menggambar, bernyanyi, menari, berhitung, olahraga, atau kegiatan kreatif lainnya?', 14),
  ('perilaku', 'Menurut Anda, apakah perkembangan anak saat ini sudah sesuai dengan usianya?', 15)
) AS q(slug, text, ord)
JOIN public.question_categories c ON c.slug = q.slug;

INSERT INTO public.ai_settings (model, temperature, max_tokens, is_active)
VALUES ('google/gemini-3.6-flash', 0.7, 4096, true);

INSERT INTO public.ai_prompts (name, system_prompt, user_template, is_active) VALUES (
'Default Assessment Prompt',
'Anda adalah asisten psikolog anak yang membantu orang tua memahami perkembangan anak usia TK (3-6 tahun). Gunakan bahasa Indonesia yang hangat, positif, membangun, mudah dipahami orang tua, dan tidak menghakimi. Hasil Anda BUKAN diagnosis, melainkan rekomendasi awal untuk pendampingan di rumah. Selalu balas dalam format JSON valid sesuai schema yang diberikan.',
'Berikut data anak dan hasil asesmen orang tua. Analisis dan buat laporan lengkap 13 bagian.

DATA ORANG TUA:
Nama: {{parent_name}}
WhatsApp: {{parent_whatsapp}}

DATA ANAK:
Nama: {{child_name}}
Jenis Kelamin: {{child_gender}}
Tanggal Lahir: {{child_birth_date}}
Umur: {{child_age}} tahun
Sekolah: {{child_school}}
Kelas: {{child_class}}

JAWABAN ASESMEN (skor 1=Tidak Pernah, 2=Jarang, 3=Kadang, 4=Sering, 5=Selalu):
{{answers}}

Buat laporan dengan 13 bagian: ringkasan, kelebihan, area_pengembangan, kecerdasan_sosial, kecerdasan_emosional, kemampuan_komunikasi, kemandirian, kemampuan_belajar, potensi, area_stimulasi, perhatian_orangtua, treatment (daftar rekomendasi kegiatan), dan kesimpulan.',
true);

INSERT INTO public.website_settings (id, data) VALUES (1, '{
  "site_name": "Parent Awareness Assessment",
  "logo_text": "PAA",
  "primary_color": "#0891b2",
  "meta_title": "Parent Awareness Assessment — Asesmen Perkembangan Anak TK",
  "meta_description": "Kenali potensi, kekuatan, dan kebutuhan perkembangan anak Anda melalui asesmen berbasis AI yang mudah dipahami orang tua.",
  "contact_whatsapp": "",
  "contact_email": "hello@example.com",
  "contact_address": "",
  "social_instagram": "",
  "social_facebook": "",
  "social_youtube": "",
  "copyright": "© 2026 Parent Awareness Assessment. All rights reserved.",
  "ga_id": "",
  "gtm_id": ""
}'::jsonb);

INSERT INTO public.homepage_settings (id, data) VALUES (1, '{
  "hero_title": "Parent Awareness Assessment",
  "hero_subtitle": "Kenali potensi, kekuatan, dan kebutuhan perkembangan anak melalui asesmen berbasis AI yang mudah dipahami oleh orang tua.",
  "hero_cta": "Mulai Assessment",
  "hero_badge": "Berbasis AI untuk anak usia 3–6 tahun",
  "why_title": "Mengapa Assessment Ini Penting",
  "why_subtitle": "Setiap anak unik. Pahami perkembangan si kecil lebih dalam agar Anda bisa mendampingi dengan tepat.",
  "why_items": [
    {"icon": "Sparkles", "title": "Deteksi Dini Potensi", "desc": "Kenali bakat dan minat anak sejak usia dini agar dapat dikembangkan optimal."},
    {"icon": "Heart", "title": "Dukungan Emosional Tepat", "desc": "Pahami kebutuhan emosi anak untuk membangun rasa percaya diri yang sehat."},
    {"icon": "Compass", "title": "Panduan Praktis", "desc": "Rekomendasi treatment yang bisa langsung diterapkan di rumah."}
  ],
  "benefits_title": "Keunggulan",
  "benefits_items": [
    {"icon": "Brain", "title": "Analisis AI Cerdas", "desc": "Menggunakan AI terbaru untuk analisis komprehensif 13 aspek perkembangan."},
    {"icon": "ShieldCheck", "title": "Aman & Privat", "desc": "Data anak Anda dilindungi dan hanya digunakan untuk analisis pribadi."},
    {"icon": "Clock", "title": "Cepat & Mudah", "desc": "Selesai dalam 5–10 menit. Hasil langsung tersedia setelah submit."},
    {"icon": "FileText", "title": "Laporan Lengkap", "desc": "13 bagian analisis: kecerdasan sosial, emosional, komunikasi, kemandirian, dan rekomendasi."}
  ],
  "how_title": "Cara Kerja",
  "how_items": [
    {"step": "1", "title": "Isi Data Anak", "desc": "Lengkapi data orang tua dan profil anak Anda."},
    {"step": "2", "title": "Jawab 15 Pertanyaan", "desc": "Pertanyaan singkat tentang perkembangan sehari-hari anak."},
    {"step": "3", "title": "AI Menganalisis", "desc": "Sistem AI menganalisis jawaban dan menyusun laporan personal."},
    {"step": "4", "title": "Terima Laporan", "desc": "Baca hasil dan terapkan rekomendasi treatment di rumah."}
  ],
  "faq_title": "Pertanyaan yang Sering Diajukan",
  "faq_items": [
    {"q": "Apakah hasil AI ini pengganti diagnosis dokter?", "a": "Tidak. Hasil ini adalah rekomendasi awal untuk pendampingan di rumah, bukan diagnosis medis atau psikologis."},
    {"q": "Berapa lama waktu yang dibutuhkan?", "a": "Sekitar 5–10 menit untuk mengisi 15 pertanyaan asesmen."},
    {"q": "Apakah data anak saya aman?", "a": "Ya. Data disimpan aman dan hanya digunakan untuk analisis personal Anda."},
    {"q": "Untuk usia berapa asesmen ini cocok?", "a": "Anak usia TK (3–6 tahun) atau anak dengan tahap perkembangan setara."}
  ],
  "footer_tagline": "Mendampingi tumbuh kembang anak dengan cinta dan pemahaman."
}'::jsonb);
