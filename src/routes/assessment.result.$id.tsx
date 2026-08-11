import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import {
  CheckCircle2,
  Sparkles,
  Home,
  GraduationCap,
  Printer,
  ShieldAlert,
  Lock,
  ClipboardList,
  AlertTriangle,
  BookOpen,
  Brain,
  MessageSquare,
  Star,
  Rocket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { getAssessmentResultFn } from "@/lib/assessment.functions";
import { getAssessmentContent } from "@/lib/assessment-content";
import { getEducationLevel } from "@/lib/questions.data";

export const Route = createFileRoute("/assessment/result/$id")({
  ssr: false,
  beforeLoad: async () => {
    const isLocalAdmin = typeof window !== "undefined" ? localStorage.getItem("paa_admin_logged_in") === "true" : false;
    const { data } = await supabase.auth.getUser();
    if (!data.user && !isLocalAdmin) {
      throw redirect({ to: "/auth" });
    }
  },
  head: () => ({ meta: [{ title: "Hasil Assessment" }, { name: "robots", content: "noindex" }] }),
  component: ResultPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft print:border-gray-300 print:shadow-none">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground print:text-black">
        <Sparkles className="h-4 w-4 text-primary print:hidden" />
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground print:text-black">{children}</div>
    </div>
  );
}

function SectionWithIcon({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft print:border-gray-300 print:shadow-none">
      <h3 className="flex items-center gap-2 text-lg font-bold text-foreground print:text-black">
        {icon || <Sparkles className="h-4 w-4 text-primary print:hidden" />}
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground print:text-black">{children}</div>
    </div>
  );
}

function SmaList({ items, variant = "default" }: { items?: string[]; variant?: "default" | "warning" | "highlight" }) {
  if (!items?.length) return <p className="italic text-muted-foreground print:text-gray-500">Tidak ada catatan spesifik.</p>;
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-foreground print:text-black">
          {variant === "warning" ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 print:text-black" />
          ) : variant === "highlight" ? (
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary print:text-black" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 print:text-black" />
          )}
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items?.length) return <p className="italic text-muted-foreground print:text-gray-500">Tidak ada catatan spesifik.</p>;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-foreground print:text-black">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary print:text-black" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function ResultPage() {
  const { id } = Route.useParams();
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const isLocalAdmin = typeof window !== "undefined" ? localStorage.getItem("paa_admin_logged_in") === "true" : false;
      const { data: userRes } = await supabase.auth.getUser();
      if (isLocalAdmin || userRes?.user) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const getResult = useServerFn(getAssessmentResultFn);

  const result = useQuery({
    queryKey: ["assessment-report-result", id, isAdmin],
    enabled: isAdmin === true,
    queryFn: async () => {
      const res = await getResult({ data: { id, adminToken: isAdmin === true } });
      return res;
    },
    refetchInterval: (q) => (q.state.data ? false : 2000),
  });

  const data = result.data;
  const c = data?.content as any;
  const childName = data?.child_name ?? "Anak";
  const parentName = data?.parent_name ?? "Orang Tua";
  const level = getEducationLevel(data || c);
  console.log("[STAGE: VIEW_RENDER]", "Education Level View:", level);
  const content = getAssessmentContent(level);

  // Synchronize dynamic metadata (title, description, Open Graph, Twitter metadata)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const pageTitle = content.getMetaTitle(childName);
      document.title = `${pageTitle} | ${website.data?.site_name ?? "Parent Insight Hub"}`;

      const setMeta = (nameOrProp: string, val: string, isProp = false) => {
        let el = document.querySelector(isProp ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`);
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute(isProp ? "property" : "name", nameOrProp);
          document.head.appendChild(el);
        }
        el.setAttribute("content", val);
      };

      setMeta("description", content.description);
      setMeta("og:title", pageTitle, true);
      setMeta("og:description", content.description, true);
      setMeta("og:type", "article", true);
      setMeta("twitter:title", pageTitle);
      setMeta("twitter:description", content.description);
      setMeta("twitter:card", "summary_large_image");
    }
  }, [childName, level, content, website.data?.site_name]);

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-gradient-soft flex flex-col justify-between">
        <PublicNav siteName={website.data?.site_name ?? "Parent Insight Hub"} logoText="PAA" />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-red-500/30 bg-card p-8 sm:p-10 shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-600 mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 mb-3">
              403 Forbidden - Akses Ditolak
            </span>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Hasil Asesmen Hanya Untuk Admin
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Mohon maaf, halaman hasil analisis AI ini hanya dapat diakses oleh <strong>Administrator / Pihak Sekolah yang Berwenang</strong>. Orang tua/pengisi asesmen tidak diizinkan mengakses hasil melalui URL secara langsung.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto rounded-full gap-2 px-6">
                  <Home className="h-4 w-4" /> Kembali ke Beranda
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="w-full sm:w-auto rounded-full bg-gradient-hero text-primary-foreground gap-2 px-6 shadow-soft">
                  <Lock className="h-4 w-4" /> Login Admin
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter
          siteName={website.data?.site_name ?? "Parent Insight Hub"}
          copyright={website.data?.copyright}
          contactEmail={website.data?.contact_email}
          contactWhatsapp={website.data?.contact_whatsapp}
        />
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-muted-foreground">Memeriksa hak akses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-24 md:pb-12 print:bg-white print:pb-0">
      <div className="print:hidden">
        <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
      </div>

      <div className="print-report mx-auto max-w-3xl px-4 py-10 sm:px-6 print:px-0 print:py-0 print:max-w-none print:w-full">
        {/* Dynamic Badge, H1, Description, Metadata */}
        {level === "SMA" ? (
          <div className="mb-8 text-center print:mb-6 print-break-inside-avoid">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3 print:hidden">
              🎓 Pemetaan Kemampuan Awal Siswa SMA
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground print:text-xl print:text-black print-break-after-avoid">
              Laporan Hasil Asesmen Kemampuan Awal Siswa SMA
            </h1>
            <p className="mt-2 text-sm text-muted-foreground print:text-xs print:text-gray-700 font-medium">
              Pemetaan Kemampuan Awal Siswa Berdasarkan Observasi Orang Tua
            </p>

            {/* Kartu Informasi Siswa */}
            <div className="student-info report-card mt-6 rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-soft text-left print:border-gray-300 print:shadow-none print:mt-4 print-break-inside-avoid">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium print:text-gray-600">Nama Siswa</span>
                  <strong className="text-sm font-bold text-foreground block mt-0.5 print:text-black">{childName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium print:text-gray-600">Kelas</span>
                  <strong className="text-sm font-bold text-foreground block mt-0.5 print:text-black">{(data as any)?.child_class || "SMA"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium print:text-gray-600">Jenjang</span>
                  <strong className="text-sm font-bold text-foreground block mt-0.5 print:text-black">SMA</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium print:text-gray-600">Tanggal Asesmen</span>
                  <strong className="text-sm font-bold text-foreground block mt-0.5 print:text-black">
                    {data?.created_at ? new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium print:text-gray-600">Status Analisis</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 mt-1 print:border print:border-emerald-600 print:text-black">
                    <CheckCircle2 className="h-3 w-3" /> Selesai Analisis
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 text-center print:mb-6">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary print:bg-transparent print:p-0 print:text-black">
              <span className="print:hidden">{content.icon}</span> <GraduationCap className="h-4 w-4 print:hidden" /> {content.badge}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl print:mt-2 print:text-2xl print:text-black">
              {content.getHeader(childName)}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base print:text-xs print:text-gray-700">
              {content.description}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs font-medium text-muted-foreground print:text-gray-800">
              <span>Nama Anak: <strong className="text-foreground print:text-black">{childName}</strong></span>
              <span>•</span>
              <span>Jenjang: <strong className="text-foreground print:text-black">{content.shortName} ({content.fullName})</strong></span>
              {data?.created_at && (
                <>
                  <span>•</span>
                  <span>Tanggal: <strong className="text-foreground print:text-black">{new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong></span>
                </>
              )}
            </div>
          </div>
        )}

        {result.isLoading || !c ? (
          <div className="rounded-3xl border border-border/60 bg-card p-10 text-center shadow-soft">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-foreground">AI sedang menyusun laporan analisis khusus jenjang {content.shortName}…</p>
          </div>
        ) : level === "TK" ? (
          /* ========================================================================= */
          /* TK — PEMETAAN AWAL TUMBUH KEMBANG ANAK (7 BAGIAN)                         */
          /* ========================================================================= */
          <div className="grid gap-5">
            {/* Status Perkembangan */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-soft text-center print:border-emerald-600 print:bg-transparent">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">🌱 Status Perkembangan</span>
              <h2 className="mt-1 text-xl font-extrabold text-emerald-800 dark:text-emerald-300 print:text-black">
                {c.status_perkembangan || "Berkembang Sesuai Harapan"}
              </h2>
              <p className="mt-2 text-xs text-emerald-900/70 dark:text-emerald-200/80 print:text-black">
                Hasil ini merupakan pemetaan awal berdasarkan observasi orang tua, bukan diagnosis.
              </p>
            </div>

            {/* 1. Kesimpulan Umum Perkembangan */}
            <Section title="1. Kesimpulan Umum Perkembangan">
              <p className="text-sm leading-relaxed text-foreground print:text-black">
                {c.kesimpulan_umum_perkembangan || c.penjelasan_status || c.ringkasan}
              </p>
            </Section>

            {/* 2. Area yang Perlu Diperhatikan */}
            <Section title="2. Area yang Perlu Diperhatikan">
              <List items={c.area_yang_perlu_diperhatikan || c.area_perlu_ditingkatkan} />
            </Section>

            {/* 3. Motorik */}
            <Section title="3. Motorik (Kasar & Halus)">
              <List items={c.motorik} />
            </Section>

            {/* 4. Bahasa & Kognitif */}
            <Section title="4. Bahasa & Kognitif">
              <List items={c.bahasa_dan_kognitif} />
            </Section>

            {/* 5. Sosial-Emosional & Kemandirian */}
            <Section title="5. Sosial-Emosional & Kemandirian">
              <List items={c.sosial_emosional_dan_kemandirian} />
            </Section>

            {/* 6. Potensi & Kelebihan Anak */}
            <Section title="6. Potensi & Kelebihan Anak">
              <List items={c.potensi_dan_kelebihan_anak || c.kekuatan_anak} />
            </Section>

            {/* 7. Rekomendasi Stimulasi untuk Orang Tua */}
            <Section title="7. Rekomendasi Stimulasi untuk Orang Tua">
              <List items={c.rekomendasi_stimulasi_untuk_orang_tua || c.rekomendasi_orangtua} />
            </Section>

            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
              >
                <Printer className="h-4 w-4" /> Cetak / Export PDF ({content.shortName})
              </button>
            </div>
          </div>
        ) : level === "SD" ? (
          /* ========================================================================= */
          /* EXPLICIT SD LEVEL REPORT                                                  */
          /* ========================================================================= */
          <div className="grid gap-5">
            {/* 1. Status Perkembangan SD */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 shadow-soft text-center print:border-blue-600 print:bg-transparent">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">📘 Status Perkembangan Sekolah Dasar</span>
              <h2 className="mt-1 text-xl font-extrabold text-blue-800 dark:text-blue-300 print:text-black">
                {c.status_perkembangan_sd || c.status_perkembangan || "Baik Sesuai Usia"}
              </h2>
              {(c.ringkasan_profil_sd || c.penjelasan_status || c.ringkasan) && (
                <p className="mt-3 text-sm leading-relaxed text-blue-900/80 dark:text-blue-200 print:text-black">
                  {c.ringkasan_profil_sd || c.penjelasan_status || c.ringkasan}
                </p>
              )}
            </div>

            {/* 2. Kelebihan Pembelajaran */}
            <Section title={content.sections.s2}>
              <List items={c.kelebihan_pembelajaran || c.kelebihan || c.kekuatan_anak} />
            </Section>

            {/* 3. Area Belajar yang Perlu Ditingkatkan */}
            <Section title={content.sections.s3}>
              <List items={c.area_belajar_ditingkatkan || c.area_pengembangan || c.area_perlu_ditingkatkan} />
            </Section>

            {/* 4. Literasi & Numerasi */}
            <Section title={content.sections.s4}>
              {c.literasi_dan_numerasi ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 print:border-gray-300">
                    <span className="text-xs font-bold text-primary uppercase print:text-black">Status Literasi & Numerasi</span>
                    <p className="mt-1 text-base font-bold text-foreground print:text-black">{c.literasi_dan_numerasi.status_literasi_numerasi}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground print:text-black">Kemampuan Literasi (Membaca, Menulis, Menyimak)</h4>
                    <div className="mt-2"><List items={c.literasi_dan_numerasi.kemampuan_literasi} /></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground print:text-black">Kemampuan Numerasi (Matematika & Pengetahuan Angka)</h4>
                    <div className="mt-2"><List items={c.literasi_dan_numerasi.kemampuan_numerasi} /></div>
                  </div>
                </div>
              ) : (
                <p>{c.kemampuan_akademik ?? c.kemampuan_belajar}</p>
              )}
            </Section>

            {/* 5. Kebiasaan & Fokus Belajar */}
            <Section title={content.sections.s6}>
              <List items={c.kebiasaan_dan_fokus_belajar || (Array.isArray(c.kecerdasan_emosional) ? c.kecerdasan_emosional : [c.kecerdasan_emosional || "Tingkat konsentrasi dan kebiasaan belajar teratur di rumah."])} />
            </Section>

            {/* 6. Karakter & Interaksi Sosial */}
            <Section title={content.sections.s7}>
              <List items={c.karakter_dan_interaksi_sosial || (Array.isArray(c.karakter) ? c.karakter : [c.karakter || c.kecerdasan_sosial])} />
            </Section>

            {/* 7. Potensi & Kreativitas */}
            <Section title={content.sections.s8}>
              <List items={c.potensi_dan_kreativitas || (Array.isArray(c.potensi) ? c.potensi : [c.potensi || c.minat_bakat])} />
            </Section>

            {/* 8. Hal Perhatian Orang Tua */}
            <Section title={content.sections.s10}>
              <List items={c.hal_perhatian_orangtua || c.perhatian_orangtua} />
            </Section>

            {/* 9. Rekomendasi Treatment Rumah */}
            <Section title={content.sections.s11}>
              {Array.isArray(c.rekomendasi_treatment_rumah || c.treatment) ? (
                <ul className="space-y-3">
                  {(c.rekomendasi_treatment_rumah || c.treatment).map((t: any, i: number) => (
                    <li key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3 print:border-gray-300">
                      <div className="text-sm font-semibold text-foreground print:text-black">{t.kategori || `Rekomendasi ${i + 1}`}</div>
                      <div className="mt-1 text-sm text-muted-foreground print:text-gray-800">{t.aktivitas || t}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{String(c.rekomendasi_treatment_rumah || c.treatment || "")}</p>
              )}
            </Section>

            {/* 10. Catatan Perkembangan SD */}
            <Section title={content.sections.s13}>
              <List items={Array.isArray(c.catatan_perkembangan_sd) ? c.catatan_perkembangan_sd : [c.catatan_perkembangan_sd || c.kesimpulan || "Pencapaian belajar dan karakter di Sekolah Dasar berkembang positif."]} />
            </Section>

            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Link>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95">
                <Printer className="h-4 w-4" /> Cetak / Export PDF (SD)
              </button>
            </div>
          </div>
        ) : level === "SMP" ? (
          /* ========================================================================= */
          /* EXPLICIT SMP LEVEL REPORT                                                 */
          /* ========================================================================= */
          <div className="grid gap-5">
            {/* 1. Status Perkembangan SMP */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 shadow-soft text-center print:border-indigo-600 print:bg-transparent">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">📗 Status Potensi Remaja SMP</span>
              <h2 className="mt-1 text-xl font-extrabold text-indigo-800 dark:text-indigo-300 print:text-black">
                {c.status_perkembangan_smp || c.status_perkembangan || "Baik Sesuai Usia Remaja"}
              </h2>
              {(c.ringkasan_dinamika_smp || c.ringkasan) && (
                <p className="mt-3 text-sm leading-relaxed text-indigo-900/80 dark:text-indigo-200 print:text-black">
                  {c.ringkasan_dinamika_smp || c.ringkasan}
                </p>
              )}
            </div>

            {/* 2. Kekuatan Akademik SMP */}
            <Section title={content.sections.s2}>
              <List items={c.kekuatan_akademik_smp || c.kelebihan} />
            </Section>

            {/* 3. Area Pengembangan SMP */}
            <Section title={content.sections.s3}>
              <List items={c.area_pengembangan_smp || c.area_pengembangan} />
            </Section>

            {/* 4. Kemampuan Berpikir Kritis */}
            <Section title={content.sections.s4}>
              {c.kemampuan_berpikir_kritis ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 print:border-gray-300">
                    <span className="text-xs font-bold text-primary uppercase print:text-black">Status Pemikiran Kritis</span>
                    <p className="mt-1 text-base font-bold text-foreground print:text-black">{c.kemampuan_berpikir_kritis.status_pemikiran_kritis}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground print:text-black">Kekuatan Analisis & Problem Solving</h4>
                    <div className="mt-2"><List items={c.kemampuan_berpikir_kritis.kekuatan_analisis} /></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground print:text-black">Area Latihan Logika & Berpikir Kritis</h4>
                    <div className="mt-2"><List items={c.kemampuan_berpikir_kritis.area_latihan_kritis} /></div>
                  </div>
                </div>
              ) : (
                <p>{c.kemampuan_akademik}</p>
              )}
            </Section>

            {/* 5. Pergaulan & Media Sosial */}
            <Section title={content.sections.s5}>
              <List items={c.pergaulan_dan_media_sosial || (Array.isArray(c.kecerdasan_sosial) ? c.kecerdasan_sosial : [c.kecerdasan_sosial])} />
            </Section>

            {/* 6. Manajemen Emosi & Sosial */}
            <Section title={content.sections.s6}>
              <List items={c.manajemen_emosi_dan_sosial || (Array.isArray(c.kecerdasan_emosional) ? c.kecerdasan_emosional : [c.kecerdasan_emosional])} />
            </Section>

            {/* 7. Kepemimpinan & Minat Cita-cita */}
            <Section title={content.sections.s9}>
              <List items={c.kepemimpinan_dan_minat || (Array.isArray(c.minat_bakat) ? c.minat_bakat : [c.minat_bakat || c.potensi])} />
            </Section>

            {/* 8. Perhatian Orang Tua SMP */}
            <Section title={content.sections.s10}>
              <List items={c.perhatian_orangtua_smp || c.perhatian_orangtua} />
            </Section>

            {/* 9. Rekomendasi Pendampingan Remaja */}
            <Section title={content.sections.s11}>
              {Array.isArray(c.rekomendasi_pendampingan_remaja || c.treatment) ? (
                <ul className="space-y-3">
                  {(c.rekomendasi_pendampingan_remaja || c.treatment).map((t: any, i: number) => (
                    <li key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3 print:border-gray-300">
                      <div className="text-sm font-semibold text-foreground print:text-black">{t.kategori || `Rekomendasi ${i + 1}`}</div>
                      <div className="mt-1 text-sm text-muted-foreground print:text-gray-800">{t.aktivitas || t}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{String(c.rekomendasi_pendampingan_remaja || c.treatment || "")}</p>
              )}
            </Section>

            {/* 10. Catatan Kesiapan SMP */}
            <Section title={content.sections.s13}>
              <List items={Array.isArray(c.catatan_kesiapan_smp) ? c.catatan_kesiapan_smp : [c.catatan_kesiapan_smp || c.kesimpulan || "Kemandirian dan kesiapan belajar remaja di SMP berkembang optimal."]} />
            </Section>

            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Link>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95">
                <Printer className="h-4 w-4" /> Cetak / Export PDF (SMP)
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* EXPLICIT SMA LEVEL REPORT (10 STRICT CLASS X CAPABILITY SECTIONS)         */
          /* ========================================================================= */
          <div className="grid gap-6">
            {/* 1. 📋 Ringkasan Kemampuan Awal */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 p-6 shadow-soft text-left print:border-blue-600 print:bg-transparent">
              <h3 className="flex items-center gap-2 text-base font-bold text-blue-900 dark:text-blue-300 print:text-black">
                <ClipboardList className="h-5 w-5 text-blue-600 print:hidden" />
                📋 Ringkasan Kemampuan Awal
              </h3>
              {(c.ringkasan_kemampuan_awal || c.ringkasan_eksekutif_sma || c.ringkasan) && (
                <p className="mt-3 text-sm leading-relaxed text-foreground print:text-black">
                  {c.ringkasan_kemampuan_awal || c.ringkasan_eksekutif_sma || c.ringkasan}
                </p>
              )}
            </div>

            {/* 2. ⚠️ Area yang Perlu Diperhatikan (Fokus Utama Laporan) */}
            <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-500/10 dark:bg-amber-950/30 p-6 shadow-md print:border-amber-600 print:bg-transparent">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-amber-900 dark:text-amber-300 print:text-black">
                <AlertTriangle className="h-5 w-5 text-amber-600 print:hidden" />
                ⚠️ Area yang Perlu Diperhatikan
              </h3>
              <p className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-300 print:text-gray-700 mb-4">
                Fokus utama pembinaan: Aspek yang memerlukan pendampingan & perhatian khusus orang tua selama anak belajar di SMA.
              </p>
              <SmaList items={c.area_yang_perlu_diperhatikan || c.area_akademik_perlu_ditingkatkan || c.area_pengembangan} variant="warning" />
            </div>

            {/* 3. 📚 Kemampuan Awal Akademik */}
            <SectionWithIcon title="📚 Kemampuan Awal Akademik" icon={<BookOpen className="h-5 w-5 text-primary print:hidden" />}>
              <SmaList items={c.kemampuan_awal_akademik || c.keunggulan_akademik_sma || c.kelebihan} />
            </SectionWithIcon>

            {/* 4. 🧠 Kemampuan Berpikir */}
            <SectionWithIcon title="🧠 Kemampuan Berpikir" icon={<Brain className="h-5 w-5 text-primary print:hidden" />}>
              <SmaList items={c.kemampuan_berpikir || c.problem_solving_dan_resiliensi} />
            </SectionWithIcon>

            {/* 5. 💬 Kemampuan Komunikasi dan Sosial */}
            <SectionWithIcon title="💬 Kemampuan Komunikasi dan Sosial" icon={<MessageSquare className="h-5 w-5 text-primary print:hidden" />}>
              <SmaList items={c.kemampuan_komunikasi_dan_sosial || c.public_speaking_dan_leadership} />
            </SectionWithIcon>

            {/* 6. ⭐ Karakter dan Kemandirian */}
            <SectionWithIcon title="⭐ Karakter dan Kemandirian" icon={<Star className="h-5 w-5 text-amber-500 print:hidden" />}>
              <SmaList items={c.karakter_dan_kemandirian || c.pengembangan_soft_hard_skills} />
            </SectionWithIcon>

            {/* 7. 🎓 Kesiapan Mengikuti Pembelajaran SMA */}
            <SectionWithIcon title="🎓 Kesiapan Mengikuti Pembelajaran SMA" icon={<GraduationCap className="h-5 w-5 text-primary print:hidden" />}>
              <SmaList items={c.kesiapan_mengikuti_pembelajaran_SMA || c.kesiapan_mengikuti_pembelajaran_sma || (c.kesiapan_kuliah_dan_perencanaan_karier ? [c.kesiapan_kuliah_dan_perencanaan_karier.status_kesiapan_ptn] : ["Siap mengikuti ritme & tuntutan pembelajaran SMA."])} />
            </SectionWithIcon>

            {/* 8. 🚀 Potensi Pengembangan */}
            <SectionWithIcon title="🚀 Potensi Pengembangan" icon={<Rocket className="h-5 w-5 text-purple-600 print:hidden" />}>
              <SmaList items={c.potensi_pengembangan || (Array.isArray(c.potensi) ? c.potensi : [c.potensi])} />
            </SectionWithIcon>

            {/* 9. 🌟 Potensi dan Kelebihan */}
            <SectionWithIcon title="🌟 Potensi dan Kelebihan" icon={<Sparkles className="h-5 w-5 text-amber-500 print:hidden" />}>
              <SmaList items={c.potensi_dan_kelebihan || c.keunggulan_akademik_sma} />
            </SectionWithIcon>

            {/* 10. 👨‍👩‍👧 Rekomendasi untuk Orang Tua */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20 p-6 shadow-soft print:border-emerald-600 print:bg-transparent">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground print:text-black mb-4">
                <Users className="h-5 w-5 text-emerald-600 print:hidden" />
                👨‍👩‍👧 Rekomendasi untuk Orang Tua
              </h3>
              {Array.isArray(c.rekomendasi_untuk_orang_tua || c.rekomendasi_strategi_masa_depan || c.perhatian_orangtua_dan_otonomi) ? (
                <ul className="space-y-3">
                  {(c.rekomendasi_untuk_orang_tua || c.rekomendasi_strategi_masa_depan || c.perhatian_orangtua_dan_otonomi).map((t: any, i: number) => (
                    <li key={i} className="rounded-xl border border-border/60 bg-card p-4 shadow-xs print:border-gray-300">
                      <div className="text-sm font-bold text-foreground print:text-black flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold print:hidden">
                          {i + 1}
                        </span>
                        {typeof t === "object" ? (t.kategori || `Rekomendasi ${i + 1}`) : `Rekomendasi ${i + 1}`}
                      </div>
                      <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground print:text-gray-800">
                        {typeof t === "object" ? (t.aktivitas || JSON.stringify(t)) : t}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed text-foreground print:text-black">
                  {String(c.rekomendasi_untuk_orang_tua || c.rekomendasi_strategi_masa_depan || c.treatment || "")}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Link>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95">
                <Printer className="h-4 w-4" /> Cetak / Export PDF (SMA)
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="print:hidden">
        <PublicFooter
          siteName={website.data?.site_name ?? "PAA"}
          copyright={website.data?.copyright}
          contactEmail={website.data?.contact_email}
          contactWhatsapp={website.data?.contact_whatsapp}
        />
      </div>
    </div>
  );
}