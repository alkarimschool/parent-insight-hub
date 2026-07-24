# Parent Awareness Assessment — Build Plan

Aplikasi web untuk asesmen perkembangan anak TK (3–6 th) berbasis AI, dengan dashboard admin lengkap dan seluruh konten dapat dikelola tanpa mengubah kode.

## Scope & Teknologi
- **Frontend**: TanStack Start + React + Tailwind v4, shadcn UI, Lucide icons
- **Backend**: Lovable Cloud (Postgres + Auth + Storage + Server Functions)
- **AI**: Lovable AI Gateway (default `google/gemini-3.6-flash`)
- **WhatsApp**: GatewayAPI connector (atau custom API URL/Token dari admin)
- **Palet**: Deep Aqua, Ocean Blue, Wave Blue, White, Soft Gray — desain premium ala Apple/Stripe/Linear

## Struktur Halaman Publik
1. `/` Home — Hero + "Mengapa Penting" + Keunggulan + Cara Kerja + FAQ + Footer (semua dari `homepage_settings`)
2. `/assessment` — Form data orang tua & anak (Nama Ortu, WA, Nama Anak, JK, Tgl Lahir, Umur auto, Sekolah, Kelas)
3. `/assessment/questions` — Pertanyaan dinamis dari DB, progress bar, auto-save (localStorage + server), navigasi prev/next/submit, skala 1–5
4. `/assessment/processing` — Loading saat AI menganalisis
5. `/assessment/result/:id` — Laporan AI 13 bagian

## Struktur Admin (`/admin`, protected)
- Login (`/auth`) — email/password + Google
- Sidebar: Dashboard, Database Orang Tua, Kelola Pertanyaan, Prompt AI, Integrasi AI, Integrasi WhatsApp, Pengaturan Website, Homepage, Activity Logs
- Dashboard stats + grafik (Recharts)
- CRUD orang tua/anak/assessment + Detail + Export Excel/PDF + Search/Filter
- CRUD pertanyaan + kategori + urutan + aktif/nonaktif + import/export Excel
- Editor Prompt AI (system prompt + user prompt template dengan placeholder `{{parent}}`, `{{child}}`, `{{answers}}`)
- Pengaturan AI (model, temperature, max_token, test button)
- Pengaturan WhatsApp (URL, token, sender, template, test button)
- Pengaturan Website (logo, warna, meta, sosial, kontak, copyright) — semua di DB
- Editor Homepage (hero, sections, FAQ, footer) — JSON blocks

## Database (Lovable Cloud, RLS aktif)
```
profiles(user_id, role)                 -- role via user_roles enum (admin/user)
user_roles(user_id, role)               -- security-definer has_role()
parents(id, name, whatsapp, created_at)
children(id, parent_id, name, gender, birth_date, school, class_name)
question_categories(id, name, order_index)
questions(id, category_id, text, order_index, is_active)
assessments(id, parent_id, child_id, status, ai_result_id, created_at)
assessment_answers(id, assessment_id, question_id, score)
ai_prompts(id, name, system_prompt, user_template, is_active)
ai_results(id, assessment_id, content_json, raw_text, created_at)
ai_settings(id, model, temperature, max_tokens, is_active)
whatsapp_settings(id, api_url, api_token, sender, template, is_active)
homepage_settings(id, data jsonb)       -- single row
website_settings(id, data jsonb)        -- single row (logo, colors, meta, contact, socials)
activity_logs(id, admin_id, action, entity, entity_id, payload, created_at)
```

RLS:
- Public INSERT ke `parents/children/assessments/assessment_answers` (anon boleh submit)
- Public SELECT ke `questions/question_categories/homepage_settings/website_settings/ai_prompts(is_active)` — kolom aman saja
- Semua tabel admin: `has_role(auth.uid(),'admin')`
- `ai_settings/whatsapp_settings/activity_logs`: admin only

## Alur AI (Server Function)
1. Submit form → insert parent+child+assessment(status=pending)+answers
2. Panggil `analyzeAssessment` server fn:
   - Ambil active `ai_prompts` + `ai_settings`
   - Render template dengan data ortu/anak/jawaban
   - Call Lovable AI Gateway (`google/gemini-3.6-flash`) dengan JSON schema untuk 13 bagian
   - Simpan `ai_results`, update `assessments.status='analyzed'`
   - (Opsional) trigger kirim WhatsApp bila aktif
3. Client redirect ke `/assessment/result/:id`

Error handling: 429/402 di-surface dgn toast. Fallback bila AI gagal → status `failed`, admin bisa retry.

## Seeding (via migration)
- 15 pertanyaan default + 5 kategori
- 1 prompt AI default (system + template lengkap 13 bagian, output JSON)
- `ai_settings` default (model gemini-3.6-flash, temp 0.7)
- `homepage_settings` & `website_settings` default (isi copywriting Indonesia)

## Design System (src/styles.css)
- Tokens oklch: `--ocean`, `--aqua`, `--wave`, `--soft-gray`, gradients (`--gradient-hero`, `--gradient-card`), shadows (`--shadow-soft`, `--shadow-elevated`), radius 16–20px
- Font: Inter/Manrope via `<link>` di `__root.tsx`
- Semua warna via token, tidak ada hex di komponen

## Deliverables urutan build
1. Enable Lovable Cloud + provision LOVABLE_API_KEY
2. Migration: schema + RLS + grants + seed
3. Auth (email/password + Google) + `_authenticated` + role gate admin
4. Design system + shared layouts (public + admin sidebar)
5. Homepage dinamis + Form orang tua + Halaman pertanyaan (auto-save)
6. Server function submit + AI analyze
7. Halaman result
8. Admin: dashboard, orang tua, pertanyaan, prompt, AI settings, WA settings, website/homepage settings, activity logs
9. Export Excel/PDF (SheetJS + jsPDF), import Excel pertanyaan
10. WhatsApp send server fn (bila settings aktif)
11. SEO (sitemap, robots, meta dinamis dari website_settings)

## Catatan
- Aplikasi cukup besar — saya akan mengirim dalam beberapa iterasi. Iterasi pertama: Cloud + skema + auth + design system + halaman publik + alur AI end-to-end. Iterasi berikutnya: modul admin per menu.
- Admin default: user pertama yang mendaftar via `/auth` akan otomatis diberikan role `admin` (trigger DB), agar Anda bisa langsung mengelola konten.
- Semua string UI (label, copy) publik diambil dari `homepage_settings`/`website_settings`. Konten default berbahasa Indonesia sesuai brief.

Setujui plan ini agar saya mulai membangun?
