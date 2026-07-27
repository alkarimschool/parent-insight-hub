import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchHomepage, fetchWebsite, DEFAULT_HOMEPAGE_DATA, DEFAULT_WEBSITE_DATA } from "@/lib/settings";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as Icons from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Icon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] ?? Icons.Sparkles;
  return <IconComponent className={className} />;
}

function Home() {
  const homepage = useQuery({
    queryKey: ["homepage"],
    queryFn: fetchHomepage,
    staleTime: 0,
    refetchOnMount: true,
  });

  const website = useQuery({
    queryKey: ["website"],
    queryFn: fetchWebsite,
    staleTime: 0,
    refetchOnMount: true,
  });

  const h = homepage.data ?? DEFAULT_HOMEPAGE_DATA;
  const w = website.data ?? DEFAULT_WEBSITE_DATA;

  const whyItems = h.why_items && h.why_items.length > 0 ? h.why_items : DEFAULT_HOMEPAGE_DATA.why_items;
  const benefitsItems = h.benefits_items && h.benefits_items.length > 0 ? h.benefits_items : DEFAULT_HOMEPAGE_DATA.benefits_items;
  const howItems = h.how_items && h.how_items.length > 0 ? h.how_items : DEFAULT_HOMEPAGE_DATA.how_items;
  const faqItems = h.faq_items && h.faq_items.length > 0 ? h.faq_items : DEFAULT_HOMEPAGE_DATA.faq_items;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav siteName={w?.site_name ?? "Parent Awareness Assessment"} logoText={w?.logo_text ?? "PAA"} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-soft" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[80%] -translate-x-1/2 rounded-full bg-gradient-hero opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
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
