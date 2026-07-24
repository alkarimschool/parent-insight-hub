import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsite, fetchHomepage } from "@/lib/settings";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { Sparkles, Heart, Brain, ShieldCheck, Mail, Phone, ArrowRight, Lightbulb, Compass, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Tentang Application — Parent Awareness Assessment" },
      { name: "description", content: "Informasi mengenai Parent Awareness Assessment, cara kerja, manfaat, dan kontak." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const homepage = useQuery({ queryKey: ["homepage"], queryFn: fetchHomepage });
  const w = website.data;
  const h = homepage.data;

  return (
    <div className="min-h-screen bg-background">
      <PublicNav siteName={w?.site_name ?? "Parent Awareness Assessment"} logoText={w?.logo_text ?? "PAA"} />

      {/* HERO TENTANG */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs font-semibold text-primary shadow-soft">
            <Lightbulb className="h-3.5 w-3.5" /> Tentang Aplikasi
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Mendampingi Tumbuh Kembang Anak Usia Emas
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Parent Awareness Assessment dirancang khusus untuk orang tua anak usia TK (3–6 tahun) untuk memahami kecerdasan sosial, emosional, komunikasi, kemandirian, dan gaya belajar anak melalui teknologi AI yang mudah dipahami.
          </p>
        </div>
      </section>

      {/* TIGA PILAR UTAMA */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">Analisis Cerdas AI</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Mengolah 15 pertanyaan asesmen menjadi 13 bagian laporan analisis perkembangan secara mendalam dan komprehensif.
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">Bahasa Positif & Membangun</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Hasil analisis bukan diagnosis medis, melainkan panduan hangat dan positif untuk pendampingan orang tua di rumah.
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 text-sky-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">Aman & Terjaga</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Data orang tua dan anak tersimpan aman di infrastruktur terenkripsi dan hanya dapat diakses oleh Anda.
            </p>
          </div>
        </div>
      </section>

      {/* MANFAAT KANAK */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">Manfaat Asesmen Bagi Orang Tua</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Memahami kelebihan dan potensi tersembunyi anak sejak dini.",
              "Mengenali area perkembangan yang memerlukan stimulasi ekstra.",
              "Mendapatkan panduan treatment dan kegiatan bermain di rumah.",
              "Meningkatkan rasa percaya diri orang tua dalam pendampingan.",
              "Mendukung persiapan kesiapan sekolah anak usia TK/PAUD.",
              "Dapat diakses kapan saja secara instan melalui perangkat Anda."
            ].map((m, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-muted/30 p-3.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium text-foreground">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KONTAK & CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 text-center">
        <div className="rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elevated">
          <h2 className="text-2xl font-bold sm:text-3xl">Mulai Asesmen Anak Anda Sekarang</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm opacity-90">
            Hanya butuh 5-10 menit untuk mengenali potensi dan kebutuhan tumbuh kembang si kecil.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-primary shadow-soft hover:opacity-95"
            >
              Mulai Assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter
        siteName={w?.site_name ?? "Parent Awareness Assessment"}
        copyright={w?.copyright}
        tagline={h?.footer_tagline}
        contactEmail={w?.contact_email}
        contactWhatsapp={w?.contact_whatsapp}
      />
    </div>
  );
}
