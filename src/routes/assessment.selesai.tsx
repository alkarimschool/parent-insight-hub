import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import { CheckCircle2, Home, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/assessment/selesai")({
  head: () => ({
    meta: [
      { title: "Asesmen Berhasil Dikirim — Parent Awareness Assessment" },
      { name: "description", content: "Terima kasih, data asesmen perkembangan anak Anda telah berhasil dikirim dan akan ditinjau oleh pihak sekolah." },
      { property: "og:title", content: "Asesmen Berhasil Dikirim" },
      { property: "og:description", content: "Data asesmen telah tersimpan dan akan ditinjau oleh pihak sekolah." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DonePage,
});

function DonePage() {
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });

  return (
    <div className="min-h-screen bg-gradient-soft">
      <PublicNav siteName={website.data?.site_name ?? "Parent Awareness Assessment"} logoText={website.data?.logo_text ?? "PAA"} />

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-border/60 bg-card p-10 text-center shadow-elevated">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">Asesmen Berhasil Disimpan</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Terima kasih. Data asesmen telah berhasil dikirim. Hasil asesmen akan ditinjau oleh pihak sekolah dan hanya
            dapat diakses oleh administrator yang berwenang.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span>Hasil analisis bersifat rahasia dan tidak ditampilkan kepada pengisi asesmen.</span>
          </div>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
          >
            <Home className="h-4 w-4" /> Kembali ke Beranda
          </Link>
        </div>
      </main>

      <PublicFooter
        siteName={website.data?.site_name ?? "Parent Awareness Assessment"}
        copyright={website.data?.copyright}
        contactEmail={website.data?.contact_email}
        contactWhatsapp={website.data?.contact_whatsapp}
      />
    </div>
  );
}