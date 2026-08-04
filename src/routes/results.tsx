import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsite } from "@/lib/settings";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { BarChart3, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Hasil Assessment — Parent Awareness Assessment" },
      { name: "description", content: "Daftar dan status hasil asesmen perkembangan anak Anda." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });

  return (
    <div className="min-h-screen bg-background">
      <PublicNav siteName={website.data?.site_name ?? "Parent Awareness Assessment"} logoText={website.data?.logo_text ?? "PAA"} />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <BarChart3 className="h-3.5 w-3.5" /> Status & Hasil Asesmen
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">Hasil Assessment</h1>
          <p className="mt-2 text-muted-foreground">Informasi mengenai akses hasil asesmen.</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-10 text-center shadow-soft">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-foreground">Hasil Analisis Bersifat Rahasia</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Hasil analisis asesmen hanya dapat diakses oleh administrator sekolah yang berwenang. Setelah mengisi
            asesmen, data Anda tersimpan dengan aman dan akan ditinjau oleh pihak sekolah.
          </p>
          <Link
            to="/assessment"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Mulai Assessment <ArrowRight className="h-4 w-4" />
          </Link>
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
