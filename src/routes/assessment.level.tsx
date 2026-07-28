import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsite } from "@/lib/settings";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { Baby, BookOpen, GraduationCap, School, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { EducationLevel } from "@/lib/questions.data";
import { getAssessmentContent } from "@/lib/assessment-content";

export const Route = createFileRoute("/assessment/level")({
  head: () => ({
    meta: [
      { title: "Pilih Jenjang Pendidikan — Parent Awareness Assessment" },
      { name: "description", content: "Pilih jenjang pendidikan anak (TK/PAUD, SD, SMP, SMA) untuk memulai asesmen khusus berbasis AI." },
    ],
  }),
  component: SelectLevelPage,
});

const LEVELS: Array<{
  key: EducationLevel;
  title: string;
  badge: string;
  desc: string;
  icon: any;
  color: string;
  features: string[];
}> = [
  {
    key: "TK",
    title: getAssessmentContent("TK").fullName,
    badge: "Usia 3–6 Tahun",
    desc: getAssessmentContent("TK").description,
    icon: Baby,
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
    features: ["Calistung & Angka Awal", "Kesiapan Sekolah", "Kemampuan Motorik & Emosi"],
  },
  {
    key: "SD",
    title: getAssessmentContent("SD").fullName,
    badge: "Usia 7–12 Tahun",
    desc: getAssessmentContent("SD").description,
    icon: BookOpen,
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
    features: ["Literasi & Numerasi SD", "Kebiasaan & Fokus Belajar", "Disiplin & Kontrol Gadget"],
  },
  {
    key: "SMP",
    title: getAssessmentContent("SMP").fullName,
    badge: "Usia 13–15 Tahun",
    desc: getAssessmentContent("SMP").description,
    icon: School,
    color: "from-indigo-500/20 to-sky-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
    features: ["Berpikir Kritis & Problem Solving", "Pergaulan & Media Sosial", "Motivasi & Target Belajar"],
  },
  {
    key: "SMA",
    title: getAssessmentContent("SMA").fullName,
    badge: "Usia 16–18 Tahun",
    desc: getAssessmentContent("SMA").description,
    icon: GraduationCap,
    color: "from-sky-500/20 to-emerald-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400",
    features: ["Kesiapan Kuliah & Karier", "Pemikiran Analitis & Riset", "Public Speaking & Kepemimpinan"],
  },
];

function SelectLevelPage() {
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const navigate = useNavigate();

  const handleSelectLevel = (lvl: EducationLevel) => {
    try {
      const existing = sessionStorage.getItem("paa_form");
      const parsed = existing ? JSON.parse(existing) : {};
      sessionStorage.setItem("paa_form", JSON.stringify({ ...parsed, education_level: lvl }));
    } catch {}
    navigate({ to: "/assessment", search: { level: lvl } as any });
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-24 md:pb-12">
      <PublicNav
        siteName={website.data?.site_name ?? "Parent Awareness Assessment"}
        logoText={website.data?.logo_text ?? "PAA"}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs font-semibold text-primary shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Langkah 1: Pilih Jenjang
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pilih Jenjang Pendidikan Anak
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Setiap jenjang pendidikan memiliki instrumen pertanyaan, standar analisis akademik, dan rekomendasi treatment AI yang disesuaikan secara khusus.
          </p>
        </div>

        {/* 4 CARDS */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {LEVELS.map((lvl) => {
            const Icon = lvl.icon;

            return (
              <div
                key={lvl.key}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated sm:p-8"
              >
                {/* Background Accent */}
                <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${lvl.color} opacity-40 blur-2xl transition group-hover:opacity-70`} />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {lvl.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-foreground">{lvl.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lvl.desc}</p>

                  <div className="mt-5 space-y-2 border-t border-border/40 pt-4">
                    {lvl.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectLevel(lvl.key)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-hero py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
                  >
                    Pilih Jenjang {lvl.key} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PublicFooter
        siteName={website.data?.site_name ?? "Parent Awareness Assessment"}
        copyright={website.data?.copyright}
        contactEmail={website.data?.contact_email}
        contactWhatsapp={website.data?.contact_whatsapp}
      />
    </div>
  );
}
