import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  fetchHomepage,
  fetchWebsite,
  fetchAssessmentCardSettings,
  DEFAULT_HOMEPAGE_DATA,
  DEFAULT_WEBSITE_DATA,
  DEFAULT_CARD_SETTINGS_DATA,
} from "@/lib/settings";
import { fetchAssessmentLocks, LOCK_MESSAGE } from "@/lib/locks";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  Sparkles,
  Baby,
  BookOpen,
  School,
  GraduationCap,
  Lock,
  CheckCircle2,
  Brain,
  User,
  Star,
  ClipboardList,
  ShieldCheck,
  Award,
  Smile,
  Zap,
  Target,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { EducationLevel } from "@/lib/questions.data";

export const Route = createFileRoute("/")({
  component: Home,
});

function Icon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] ?? Icons.Sparkles;
  return <IconComponent className={className} />;
}

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

function Home() {
  const navigate = useNavigate();
  const homepage = useQuery({ queryKey: ["homepage"], queryFn: fetchHomepage, staleTime: 0 });
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite, staleTime: 0 });
  const cardSettings = useQuery({ queryKey: ["assessment-card-settings"], queryFn: fetchAssessmentCardSettings, staleTime: 0, refetchOnMount: "always", refetchInterval: 2000 });
  const locks = useQuery({ queryKey: ["assessment-locks"], queryFn: fetchAssessmentLocks, staleTime: 0, refetchOnMount: "always", refetchInterval: 2000 });

  const h = homepage.data ?? DEFAULT_HOMEPAGE_DATA;
  const w = website.data ?? DEFAULT_WEBSITE_DATA;
  const cardsData = cardSettings.data || DEFAULT_CARD_SETTINGS_DATA;

  const whyItems = h.why_items && h.why_items.length > 0 ? h.why_items : DEFAULT_HOMEPAGE_DATA.why_items;
  const benefitsItems = h.benefits_items && h.benefits_items.length > 0 ? h.benefits_items : DEFAULT_HOMEPAGE_DATA.benefits_items;
  const howItems = h.how_items && h.how_items.length > 0 ? h.how_items : DEFAULT_HOMEPAGE_DATA.how_items;
  const faqItems = h.faq_items && h.faq_items.length > 0 ? h.faq_items : DEFAULT_HOMEPAGE_DATA.faq_items;

  const handleSelectLevel = (lvl: EducationLevel) => {
    const isLocked = locks.data?.[lvl] === true;
    if (isLocked) {
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

  return (
    <div className="min-h-screen bg-background">
      <PublicNav siteName={w?.site_name ?? "Parent Awareness Assessment"} logoText={w?.logo_text ?? "PAA"} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-soft" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[80%] -translate-x-1/2 rounded-full bg-gradient-hero opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          {h?.hero_badge && (
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {h.hero_badge}
            </div>
          )}
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            {h?.hero_title ?? DEFAULT_HOMEPAGE_DATA.hero_title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {h?.hero_subtitle ?? DEFAULT_HOMEPAGE_DATA.hero_subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/assessment/level"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:-translate-y-0.5"
            >
              {h?.hero_cta ?? DEFAULT_HOMEPAGE_DATA.hero_cta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* DYNAMIC CARD ASSESSMENT SECTION (HOMEPAGE) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 border-t border-border/40">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Modul Asesmen Berbasis AI
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pilihan Jenjang Assessment
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Status aksesibilitas setiap jenjang dikendalikan langsung secara real-time melalui Dashboard Admin.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LEVEL_KEYS.map((key) => {
            const card = cardsData[key] || DEFAULT_CARD_SETTINGS_DATA[key];
            const Icon = ICON_MAP[card.icon] || GraduationCap;
            const isLocked = locks.data?.[key] === true;
            const colorClass = COLOR_MAP[card.badge_color || "blue"] || COLOR_MAP.blue;

            return (
              <div
                key={key}
                aria-disabled={isLocked}
                className={
                  "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-soft " +
                  (isLocked
                    ? "cursor-not-allowed opacity-75 grayscale select-none bg-muted/30"
                    : "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated")
                }
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={"grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary " + (isLocked ? "" : "group-hover:scale-110 transition-transform")}>
                      {isLocked ? <Lock className="h-5 w-5 text-amber-600" /> : <Icon className="h-5 w-5" />}
                    </span>
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        🔒 Terkunci
                      </span>
                    ) : card.badge_text ? (
                      <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {card.badge_text}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">{card.desc}</p>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleSelectLevel(key)}
                    className={
                      "flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold shadow-soft transition " +
                      (isLocked
                        ? "cursor-not-allowed bg-muted text-muted-foreground border border-border/60"
                        : "bg-gradient-hero text-primary-foreground hover:opacity-95")
                    }
                  >
                    {isLocked ? (
                      <>
                        <Lock className="h-3.5 w-3.5" /> Terkunci
                      </>
                    ) : (
                      <>
                        {card.button_text || "Mulai Assessment"} <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {h?.why_title ?? DEFAULT_HOMEPAGE_DATA.why_title}
          </h2>
          {h?.why_subtitle && <p className="mt-3 text-muted-foreground">{h.why_subtitle}</p>}
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyItems.map((it, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon name={it.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {h?.benefits_title ?? DEFAULT_HOMEPAGE_DATA.benefits_title}
          </h2>
          {h?.benefits_subtitle && <p className="mt-3 text-muted-foreground">{h.benefits_subtitle}</p>}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefitsItems.map((it, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition hover:-translate-y-1">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                <Icon name={it.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {h?.how_title ?? DEFAULT_HOMEPAGE_DATA.how_title}
          </h2>
          {h?.how_subtitle && <p className="mt-3 text-muted-foreground">{h.how_subtitle}</p>}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItems.map((it, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {it.step}
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-foreground sm:text-4xl">
          {h?.faq_title ?? DEFAULT_HOMEPAGE_DATA.faq_title}
        </h2>
        {h?.faq_subtitle && <p className="mt-3 text-center text-muted-foreground">{h.faq_subtitle}</p>}
        <Accordion type="single" collapsible className="mt-8 rounded-2xl border border-border/60 bg-card px-2 shadow-soft">
          {faqItems.map((f, i) => (
            <AccordionItem key={i} value={`i-${i}`} className="px-4">
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-center text-primary-foreground shadow-elevated">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {h?.cta_title ?? "Siap memahami perkembangan anak Anda?"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            {h?.cta_subtitle ?? "Selesaikan asesmen dalam 5–10 menit dan dapatkan laporan personal."}
          </p>
          <Link
            to="/assessment/level"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-primary shadow-soft transition hover:-translate-y-0.5"
          >
            {h?.cta_btn_text ?? h?.hero_cta ?? "Mulai Assessment"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter
        siteName={w?.site_name ?? "Parent Awareness Assessment"}
        copyright={w?.copyright}
        tagline={h?.footer_tagline ?? DEFAULT_HOMEPAGE_DATA.footer_tagline}
        contactEmail={w?.contact_email}
        contactWhatsapp={w?.contact_whatsapp}
      />
    </div>
  );
}
