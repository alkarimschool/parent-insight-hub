import { supabase } from "@/integrations/supabase/client";

export interface HomepageData {
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  hero_badge?: string;
  why_title: string;
  why_subtitle?: string;
  why_items: Array<{ icon: string; title: string; desc: string }>;
  benefits_title: string;
  benefits_items: Array<{ icon: string; title: string; desc: string }>;
  how_title: string;
  how_items: Array<{ step: string; title: string; desc: string }>;
  faq_title: string;
  faq_items: Array<{ q: string; a: string }>;
  footer_tagline?: string;
}

export interface WebsiteData {
  site_name: string;
  logo_text: string;
  primary_color?: string;
  meta_title: string;
  meta_description: string;
  contact_whatsapp?: string;
  contact_email?: string;
  contact_address?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_youtube?: string;
  copyright?: string;
  ga_id?: string;
  gtm_id?: string;
}

export const DEFAULT_HOMEPAGE_DATA: HomepageData = {
  hero_title: "Pahami Perkembangan & Potensi Anak Anda dengan Analisis AI",
  hero_subtitle: "Asesmen interaktif untuk orang tua dalam mengidentifikasi pola pengasuhan, tumbuh kembang anak, dan solusi edukatif personal.",
  hero_cta: "Mulai Asesmen Sekarang",
  hero_badge: "Terpercaya & Komprehensif",
  why_title: "Mengapa Memilih PAA?",
  why_subtitle: "Pendekatan berbasis ilmu sains pengasuhan dan teknologi kecerdasan buatan.",
  why_items: [
    { icon: "BrainCircuit", title: "Analisis Berbasis AI", desc: "Rekomendasi instan yang disesuaikan dengan profil spesifik anak Anda." },
    { icon: "Sparkles", title: "Mudah & Cepat", desc: "Selesaikan pertanyaan asesmen hanya dalam waktu 5-10 menit." },
    { icon: "ShieldCheck", title: "Privasi Terjaga", desc: "Data keluarga Anda terenkripsi aman dan tidak dipublikasikan." },
  ],
  benefits_title: "Manfaat Yang Anda Dapatkan",
  benefits_items: [
    { icon: "CheckCircle", title: "Laporan Detail", desc: "Evaluasi lengkap berbagai aspek tumbuh kembang." },
    { icon: "Heart", title: "Panduan Pengasuhan", desc: "Saran praktis sehari-hari untuk mendampingi anak." },
    { icon: "Target", title: "Solusi Fokus Target", desc: "Fokus pada penguatan kelebihan dan perbaikan kendala." },
    { icon: "Clock", title: "Akses Kapan Saja", desc: "Laporan tersimpan dan dapat diakses kapan pun Anda butuhkan." },
  ],
  how_title: "Cara Kerja Asesmen",
  how_items: [
    { step: "1", title: "Pilih Jenjang", desc: "Pilih jenjang pendidikan anak (TK, SD, SMP, SMA/SMK)." },
    { step: "2", title: "Isi Asesmen", desc: "Jawab pertanyaan seputar aktivitas dan kebiasaan anak." },
    { step: "3", title: "Proses AI", desc: "Sistem meganalisis pola jawaban secara mendalam." },
    { step: "4", title: "Terima Laporan", desc: "Dapatkan hasil analisis dan panduan lengkap." },
  ],
  faq_title: "Pertanyaan yang Sering Diajukan",
  faq_items: [
    { q: "Berapa lama waktu yang dibutuhkan?", a: "Sekitar 5 hingga 10 menit untuk menyelesaikan seluruh pertanyaan." },
    { q: "Apakah asesmen ini gratis?", a: "Ya, Anda dapat mencoba asesmen secara gratis dan mendapatkan laporan evaluasi." },
  ],
  footer_tagline: "Mendampingi tumbuh kembang anak Indonesia menuju masa depan gemilang.",
};

export const DEFAULT_WEBSITE_DATA: WebsiteData = {
  site_name: "Parent Awareness Assessment",
  logo_text: "PAA",
  meta_title: "Parent Awareness Assessment | Analisis Perkembangan Anak",
  meta_description: "Platform asesmen kesadaran orang tua untuk mengukur dan mendukung perkembangan anak secara komprehensif berbasis AI.",
  contact_email: "support@parentinsight.id",
  contact_whatsapp: "6281234567890",
  copyright: "© 2026 Parent Awareness Assessment. All rights reserved.",
  ga_id: "",
};

export async function fetchHomepage(): Promise<HomepageData> {
  try {
    const { data } = await supabase.from("homepage_settings").select("data").eq("id", 1).maybeSingle();
    const raw = (data?.data as any) ?? null;
    if (!raw) return DEFAULT_HOMEPAGE_DATA;
    const unwrapped = raw?.data ?? raw;
    return { ...DEFAULT_HOMEPAGE_DATA, ...unwrapped };
  } catch {
    return DEFAULT_HOMEPAGE_DATA;
  }
}

export async function fetchWebsite(): Promise<WebsiteData> {
  try {
    const { data } = await supabase.from("website_settings").select("data").eq("id", 1).maybeSingle();
    const raw = (data?.data as any) ?? null;
    if (!raw) return DEFAULT_WEBSITE_DATA;
    const unwrapped = raw?.data ?? raw;
    return { ...DEFAULT_WEBSITE_DATA, ...unwrapped };
  } catch {
    return DEFAULT_WEBSITE_DATA;
  }
}