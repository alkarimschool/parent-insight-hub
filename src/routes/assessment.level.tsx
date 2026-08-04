import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsite, fetchAssessmentCardSettings, DEFAULT_CARD_SETTINGS_DATA } from "@/lib/settings";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import {
  Baby, BookOpen, GraduationCap, School, ArrowRight, Sparkles, CheckCircle2, Lock,
  Brain, User, Star, ClipboardList, ShieldCheck, Award, Smile, Zap, Target, Lightbulb
} from "lucide-react";
import { EducationLevel } from "@/lib/questions.data";
import { fetchAssessmentLocks, LOCK_MESSAGE } from "@/lib/locks";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment/level")({
  head: () => ({
    meta: [
      { title: "Pilih Jenjang Pendidikan — Parent Awareness Assessment" },
      { name: "description", content: "Pilih jenjang pendidikan anak (TK/PAUD, SD, SMP, SMA) untuk memulai asesmen khusus berbasis AI." },
    ],
  }),
  component: SelectLevelPage,
});

const ICON_MAP: Record<string, any> = {
  Baby,
  BookOpen,
  School,
  GraduationCap,
  Brain,
  User,
  Star,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  Award,
  Smile,
  Zap,
  Target,
  Lightbulb,
};

const COLOR_MAP: Record<string, string> = {
  cyan: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
  blue: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
  indigo: "from-indigo-500/20 to-sky-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
  sky: "from-sky-500/20 to-emerald-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400",
  emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  amber: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
  purple: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
};

const LEVEL_KEYS: EducationLevel[] = ["TK", "SD", "SMP", "SMA"];

function SelectLevelPage() {
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const cardSettings = useQuery({ queryKey: ["assessment-card-settings"], queryFn: fetchAssessmentCardSettings, staleTime: 0, refetchOnMount: "always", refetchInterval: 2000 });
  const locks = useQuery({ queryKey: ["assessment-locks"], queryFn: fetchAssessmentLocks, staleTime: 0, refetchOnMount: "always", refetchInterval: 2000 });
  const navigate = useNavigate();

  const handleSelectLevel = (lvl: EducationLevel) => {
    if (locks.data?.[lvl]) {
      toast.error(LOCK_MESSAGE);
      return;
    }
    try {
      const existing = sessionStorage.getItem("paa_form");
      const parsed = existing ? JSON.parse(existing) : {};
      sessionStorage.setItem("paa_form", JSON.stringify({ ...parsed, education_level: lvl }));
    } catch {}
    navigate({ to: "/assessment", search: { level: lvl } as any });
  };

  const cardsData = cardSettings.data || DEFAULT_CARD_SETTINGS_DATA;

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

        {/* 4 CARDS DYNAMIC FROM DATABASE */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {LEVEL_KEYS.map((key) => {
            const card = cardsData[key] || DEFAULT_CARD_SETTINGS_DATA[key];
            const Icon = ICON_MAP[card.icon] || GraduationCap;
            const isLocked = card.is_locked === true || locks.data?.[key] === true;
            const colorClass = COLOR_MAP[card.badge_color || "blue"] || COLOR_MAP.blue;
            const showBadge = card.badge_show !== false;

            return (
              <div
                key={key}
                aria-disabled={isLocked}
                className={
                  "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-8 " +
                  (isLocked
                    ? "cursor-not-allowed opacity-70 grayscale select-none"
                    : "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated")
                }
              >
                {/* Background Accent */}
                <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${colorClass} opacity-40 blur-2xl transition ${isLocked ? "" : "group-hover:opacity-70"}`} />

                <div>
                  <div className="flex items-center justify-between">
                    <span className={"grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 " + (isLocked ? "" : "group-hover:scale-110")}>
                      {isLocked ? <Lock className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </span>
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        🔒 Sedang Dalam Pengembangan
                      </span>
                    ) : showBadge && card.badge_text ? (
                      <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {card.badge_text}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>

                  <div className="mt-5 space-y-2 border-t border-border/40 pt-4">
                    {(card.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {isLocked ? (
                    <p className="mt-4 rounded-2xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                      {card.info_message || LOCK_MESSAGE}
                    </p>
                  ) : card.info_message ? (
                    <p className="mt-4 rounded-2xl bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground border border-primary/10">
                      {card.info_message}
                    </p>
                  ) : null}
                </div>

                <div className="mt-8 pt-2">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleSelectLevel(key)}
                    className={
                      "flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold shadow-soft transition " +
                      (isLocked
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : "bg-gradient-hero text-primary-foreground hover:opacity-95")
                    }
                  >
                    {isLocked ? (
                      <>
                        <Lock className="h-4 w-4" /> Terkunci
                      </>
                    ) : (
                      <>
                        {card.button_text || `Pilih Jenjang ${key}`} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </>
                    )}
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
