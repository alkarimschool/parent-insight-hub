import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchWebsite } from "@/lib/settings";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { BarChart3, ArrowRight, FileCheck, Calendar, User, ShieldAlert, Lock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Hasil Assessment — Parent Awareness Assessment" },
      { name: "description", content: "Daftar dan status hasil asesmen perkembangan anak." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
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

  const query = useQuery({
    queryKey: ["public-recent-results", isAdmin],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data } = await supabase
        .from("assessments")
        .select("id, status, created_at, children(name), parents(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const list = query.data ?? [];

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <PublicNav siteName={website.data?.site_name ?? "Parent Awareness Assessment"} logoText={website.data?.logo_text ?? "PAA"} />

        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-red-500/30 bg-card p-8 sm:p-10 shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-600 mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 mb-3">
              403 Forbidden - Akses Ditolak
            </span>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Akses Hasil Asesmen Dibatasi
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Daftar dan detail hasil analisis asesmen hanya dapat diakses oleh <strong>Administrator / Pihak Sekolah yang Berwenang</strong>. Orang tua/pengisi asesmen dapat menghubungi pihak sekolah untuk mendapatkan laporan asesmen.
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
          siteName={website.data?.site_name ?? "Parent Awareness Assessment"}
          copyright={website.data?.copyright}
          contactEmail={website.data?.contact_email}
          contactWhatsapp={website.data?.contact_whatsapp}
        />
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-muted-foreground">Memeriksa hak akses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav siteName={website.data?.site_name ?? "Parent Awareness Assessment"} logoText={website.data?.logo_text ?? "PAA"} />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <BarChart3 className="h-3.5 w-3.5" /> Status & Hasil Asesmen
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">Hasil Assessment</h1>
          <p className="mt-2 text-muted-foreground">
            Lihat laporan perkembangan anak yang telah dianalisis.
          </p>
        </div>

        {query.isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Memuat hasil assessment…</div>
        ) : list.length === 0 ? (
          <div className="rounded-3xl border border-border/60 bg-card p-10 text-center shadow-soft">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-bold text-foreground">Belum Ada Hasil Assessment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Anda belum mengisi assessment atau data baru saja dibersihkan. Silakan isi form assessment sekarang.
            </p>
            <Link
              to="/assessment"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              Mulai Assessment Baru <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((item: any) => {
              const childName = item.children?.name ?? "Anak";
              const parentName = item.parents?.name ?? "Orang Tua";
              const isAnalyzed = item.status === "analyzed";
              const dateStr = new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-soft gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-base">{childName}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isAnalyzed ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {isAnalyzed ? "Sudah Dianalisis" : "Proses Analisis"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> Orang Tua: {parentName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {dateStr}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isAnalyzed ? (
                      <Link
                        to="/assessment/result/$id"
                        params={{ id: item.id }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-hero px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90"
                      >
                        <FileCheck className="h-3.5 w-3.5" /> Lihat Laporan <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sedang dianalisis…</span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-6 text-center">
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-primary hover:bg-accent"
              >
                + Mulai Assessment Baru
              </Link>
            </div>
          </div>
        )}
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
