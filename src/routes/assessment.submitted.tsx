import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import { CheckCircle, Home, ClipboardEdit, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/assessment/submitted")({
  head: () => ({
    meta: [
      { title: "Asesmen Berhasil Dikirim" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SubmittedPage,
});

function SubmittedPage() {
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col justify-between">
      <PublicNav siteName={website.data?.site_name ?? "Parent Insight Hub"} logoText="PAA" />

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <div className="rounded-3xl border border-border/60 bg-card p-8 sm:p-12 shadow-soft">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Asesmen Terkirim
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Terima Kasih! Data Asesmen Berhasil Dikirim
          </h1>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
            Data asesmen telah berhasil dikirim. Hasil asesmen akan ditinjau oleh pihak sekolah dan hanya dapat diakses oleh administrator yang berwenang.
          </p>

          <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto rounded-full gap-2 px-6">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Button>
            </Link>
            <Link to="/assessment/level">
              <Button className="w-full sm:w-auto rounded-full bg-gradient-hero text-primary-foreground gap-2 px-6 shadow-soft">
                <ClipboardEdit className="h-4 w-4" /> Isi Asesmen Lain
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
