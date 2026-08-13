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
  AlertCircle,
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
import { getAssessmentContent, TK_PARENT_NOTE } from "@/lib/assessment-content";
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

function ChecklistItems({ items, iconType = "square" }: { items?: string[]; iconType?: "square" | "check" }) {
  if (!items?.length) return <p className="italic text-muted-foreground print:text-gray-500">Tidak ada catatan spesifik.</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground print:text-black print:text-xs">
          <span className="mt-0.5 shrink-0 text-base font-bold text-primary print:text-emerald-700">
            {iconType === "check" ? "✓" : "☐"}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function TkBulletList({
  items,
  variant = "warning",
}: {
  items?: string | string[];
  variant?: "warning" | "check" | "bullet";
}) {
  let list: string[] = [];
  if (Array.isArray(items)) {
    list = items.filter((x) => typeof x === "string" && x.trim().length > 0);
  } else if (typeof items === "string" && items.trim().length > 0) {
    list = items
      .split(/\n|•|;-/)
      .map((s) => s.replace(/^[-•*]\s*/, "").trim())
      .filter((s) => s.length > 0);
  }

  if (list.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground print:text-gray-600">
        Perkembangan anak berjalan sangat baik, tidak ada catatan khusus yang memerlukan perhatian mendesak saat ini.
      </p>
    );
  }

  const cleanItemText = (text: string) => {
    if (!text || typeof text !== "string") return text;
    let s = text.trim();
    if (s.startsWith("✓")) return s;
    s = s.replace(/^[⚠️✓]\s*/, "");
    s = s.replace(/^(?:\[[^\]]+\]|aspek\s+[^:]+|(?:motorik\s+halus|motorik\s+kasar|motorik|bahasa\s*(?:&|dan)\s*komunikasi|bahasa|kognitif\s*(?:&|dan)?\s*(?:cara\s+berpikir)?|sosial\s*-\s*emosional|sosial|kemandirian\s*(?:&|dan)?\s*(?:kesiapan\s+belajar)?|[A-Za-z\s&-]+))\s*:\s*/i, "");
    s = s.replace(/^(?:pada|dalam)\s+aspek\s+[a-z\s&-]+,\s*/i, "");
    if (/^area\s+/i.test(s)) {
      s = s.replace(/^area\s+/i, "Kemampuan ");
    }
    if (!/^(anak|kemampuan|perlu|pada|bimbingan|pendampingan)/i.test(s)) {
      s = "Anak masih membutuhkan pendampingan dalam " + s.charAt(0).toLowerCase() + s.slice(1);
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <ul className="space-y-2.5">
      {list.map((it, i) => {
        const textToDisplay = variant === "warning" ? cleanItemText(it) : it.replace(/^[⚠️✓]\s*/, "");
        return (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground print:text-black print:text-xs">
            {variant === "warning" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 print:text-amber-700" />
            ) : variant === "check" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 print:text-emerald-700" />
            ) : (
              <span className="mt-0.5 shrink-0 font-bold text-primary print:text-emerald-700">•</span>
            )}
            <span>{textToDisplay}</span>
          </li>
        );
      })}
    </ul>
  );
}

function AspectCard({ label, content }: { label: string; content?: string | string[] }) {
  const text = Array.isArray(content) ? content.join(" ") : (content || "-");
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm print:border-gray-300 print:bg-white print:p-3 print:shadow-none print-break-inside-avoid">
      <h4 className="text-xs font-bold uppercase tracking-wider text-primary print:text-black mb-1.5">{label}</h4>
      <p className="text-xs leading-relaxed text-foreground/90 print:text-black print:text-[11px]">{text}</p>
    </div>
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

  const cleanChildName = (childName || "").replace(/^ananda\s+/i, "").trim() || "Anak";
  const childClass =
    (data as any)?.child_class ||
    (data as any)?.class_name ||
    (data as any)?.child?.class_name ||
    (data as any)?.children?.[0]?.class_name ||
    "TK B Pangeran Anatsari";
  const formattedDate = data?.created_at
    ? new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

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
        ) : level === "TK" ? (
          <div className="mb-8 text-center print:hidden">
            <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              🌱 PAUD / TK
            </div>
            <h1 className="mt-3 text-2xl font-black uppercase tracking-wider text-foreground sm:text-3xl">
              LAPORAN PEMETAAN AWAL TUMBUH KEMBANG ANAK
            </h1>
            <h2 className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400 sm:text-2xl">
              Ananda {cleanChildName}
            </h2>
            <p className="mt-2 text-xs font-medium text-muted-foreground sm:text-sm">
              Hasil pemetaan perkembangan anak berdasarkan observasi orang tua
            </p>
            <div className="mt-4 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground">
              <span>Nama Anak: <strong className="text-foreground">{cleanChildName}</strong></span>
              <span>•</span>
              <span>Kelas: <strong className="text-foreground">{childClass}</strong></span>
              <span>•</span>
              <span>Jenjang: <strong className="text-foreground">Pendidikan Anak Usia Dini (TK / PAUD)</strong></span>
              <span>•</span>
              <span>Tanggal Asesmen: <strong className="text-foreground">{formattedDate}</strong></span>
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
          /* TK / PAUD — PEMETAAN AWAL TUMBUH KEMBANG ANAK (EXACT 6 SECTIONS, 0 SCORE) */
          /* ========================================================================= */
          (() => {
            const rawStatus = String(c.status_perkembangan || "Berkembang Sesuai Harapan");
            const isPositiveStatus = /sesuai harapan|berkembang baik|sangat baik|optimal/i.test(rawStatus);

            const statusTheme = isPositiveStatus
              ? {
                  cardClass: "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/30 print:border-emerald-600 print:bg-emerald-50/60",
                  badgeClass: "text-emerald-800 dark:text-emerald-300 print:text-emerald-900",
                  titleClass: "text-emerald-900 dark:text-emerald-200 print:text-black",
                  icon: <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 print:text-emerald-800" />,
                  label: "🌱 1. Status Perkembangan",
                }
              : {
                  cardClass: "border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 print:border-amber-600 print:bg-amber-50/60",
                  badgeClass: "text-amber-800 dark:text-amber-300 print:text-amber-900",
                  titleClass: "text-amber-900 dark:text-amber-200 print:text-black",
                  icon: <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 print:text-amber-800" />,
                  label: "💡 1. Status Perkembangan",
                };

            return (
              <div className="tk-report-container space-y-6">
                {/* Header Khusus Cetak / PDF */}
                <div className="hidden print:block print:mb-6 print:border-b-2 print:border-emerald-700 print:pb-4">
                  <div className="text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                      SEKOLAH ALAM AL-KARIM
                    </div>
                    <h1 className="mt-1 text-lg font-black uppercase tracking-wider text-black">
                      LAPORAN PEMETAAN AWAL TUMBUH KEMBANG ANAK
                    </h1>
                    <h2 className="mt-0.5 text-base font-bold text-black">
                      Ananda {cleanChildName}
                    </h2>
                    <p className="mt-1 text-[11px] font-medium text-gray-700">
                      Hasil pemetaan perkembangan anak berdasarkan observasi orang tua
                    </p>
                  </div>

                  <div className="mt-3.5 flex flex-wrap justify-between items-center text-xs text-black border-t border-gray-300 pt-2.5">
                    <div>Nama Anak: <strong>{cleanChildName}</strong></div>
                    <div>Kelas: <strong>{childClass}</strong></div>
                    <div>Jenjang: <strong>Pendidikan Anak Usia Dini (TK / PAUD)</strong></div>
                    <div>Tanggal Asesmen: <strong>{formattedDate}</strong></div>
                  </div>
                </div>

                {/* 1. Status Perkembangan */}
                <div className={`rounded-2xl border p-6 shadow-soft text-center print:p-4 print-break-inside-avoid ${statusTheme.cardClass}`}>
                  <div className="mx-auto inline-flex items-center gap-2 mb-1">
                    {statusTheme.icon}
                    <span className={`text-xs font-bold uppercase tracking-wider ${statusTheme.badgeClass}`}>
                      {statusTheme.label}
                    </span>
                  </div>
                  <h2 className={`text-2xl font-black ${statusTheme.titleClass} print:text-xl`}>
                    {rawStatus}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed opacity-90 print:text-gray-800">
                    * Catatan: {TK_PARENT_NOTE}
                  </p>
                </div>

                {/* 2. Area yang Perlu Diperhatikan */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 dark:border-amber-800/40 p-6 shadow-soft print:border-amber-400 print:bg-amber-50/40 print:p-4 print-break-inside-avoid">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-amber-900 dark:text-amber-300 print:text-black mb-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 print:text-amber-700" />
                    2. Area yang Perlu Diperhatikan
                  </h3>
                  <TkBulletList items={c.area_yang_perlu_diperhatikan || c.area_perlu_ditingkatkan} variant="warning" />
                </div>

                {/* 3. Gambaran Perkembangan Anak (4 Aspek Utama) */}
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft print:border-gray-300 print:shadow-none print:p-4 print-break-inside-avoid">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground print:text-black mb-4">
                    <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400 print:hidden" />
                    3. Gambaran Perkembangan Anak
                  </h3>

                  {c.gambaran_perkembangan_anak || c.bahasa_dan_komunikasi || c.sosial_dan_emosional || c.motorik || c.kognitif_dan_cara_berpikir ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/50 bg-background/50 p-4 print:border-gray-200 print:bg-white print:p-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground print:text-black mb-1.5">
                          <span>🗣️</span> Bahasa & Komunikasi
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground print:text-black">
                          {c.gambaran_perkembangan_anak?.bahasa_dan_komunikasi || c.bahasa_dan_komunikasi || c.perkembangan_bahasa || "Anak berkembang baik dalam menyampaikan kebutuhan dan memahami percakapan sehari-hari."}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-background/50 p-4 print:border-gray-200 print:bg-white print:p-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground print:text-black mb-1.5">
                          <span>❤️</span> Sosial & Emosional
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground print:text-black">
                          {c.gambaran_perkembangan_anak?.sosial_dan_emosional || c.sosial_dan_emosional || c.perkembangan_sosial_emosional || "Anak mampu berinteraksi secara positif dan mulai belajar mengelola emosinya."}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-background/50 p-4 print:border-gray-200 print:bg-white print:p-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground print:text-black mb-1.5">
                          <span>🏃</span> Motorik (Kasar & Halus)
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground print:text-black">
                          {c.gambaran_perkembangan_anak?.motorik || c.motorik || c.perkembangan_motorik || "Koordinasi gerakan tubuh fisik dan kelincahan ketelitian jemari berkembang aktif."}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-background/50 p-4 print:border-gray-200 print:bg-white print:p-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground print:text-black mb-1.5">
                          <span>🧠</span> Kognitif & Cara Berpikir
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground print:text-black">
                          {c.gambaran_perkembangan_anak?.kognitif_dan_cara_berpikir || c.kognitif_dan_cara_berpikir || c.perkembangan_kognitif || "Konsentrasi, memori, dan rasa ingin tahu anak berkembang dengan rasa penasaran positif."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground print:text-black print:text-xs">
                      {c.kesimpulan_umum_perkembangan || c.penjelasan_status || c.ringkasan}
                    </p>
                  )}
                </div>

                {/* Page Break setelah Bagian 3 untuk Cetak A4 */}
                <div className="hidden print:block print:break-before-page" />

                {/* 4. Potensi & Kelebihan */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-6 shadow-soft print:border-emerald-500/40 print:bg-emerald-50/30 print:p-4 print-break-inside-avoid">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-900 dark:text-emerald-300 print:text-black mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 print:text-emerald-700" />
                    4. Potensi & Kelebihan
                  </h3>
                  <TkBulletList items={c.potensi_dan_kelebihan || c.potensi_dan_kelebihan_anak || c.kekuatan_anak} variant="check" />
                </div>

                {/* 5. Catatan untuk Orang Tua */}
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft print:border-gray-300 print:shadow-none print:p-4 print-break-inside-avoid">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground print:text-black mb-3">
                    <Users className="h-5 w-5 text-emerald-600 print:hidden" />
                    5. Catatan untuk Orang Tua
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground print:text-black print:text-xs">
                    {TK_PARENT_NOTE}
                  </p>
                </div>

                {/* Footer Resmi Cetak / PDF */}
                <div className="hidden print:block print:mt-8 print:border-t print:border-gray-300 print:pt-3 print:text-center text-[10px] text-gray-600">
                  <p className="font-semibold">Pemetaan Awal Tumbuh Kembang Anak • Sekolah Alam Al-Karim</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Laporan Asesmen Observasi Keluarga di Rumah</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
                  <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
                    <Home className="h-4 w-4" /> Kembali ke Beranda
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
                  >
                    <Printer className="h-4 w-4" /> Cetak / Export PDF (TK)
                  </button>
                </div>
              </div>
            );
          })()
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