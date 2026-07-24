import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import { CheckCircle2, Sparkles, Home, GraduationCap, Printer } from "lucide-react";

export const Route = createFileRoute("/assessment/result/$id")({
  head: () => ({ meta: [{ title: "Hasil Assessment" }, { name: "robots", content: "noindex" }] }),
  component: ResultPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items?.length) return <p className="italic">Tidak ada data.</p>;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function ResultPage() {
  const { id } = Route.useParams();
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const result = useQuery({
    queryKey: ["result", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_results")
        .select("content, created_at, assessments(education_level, child_id, children(name, birth_date, gender), parents(name))")
        .eq("assessment_id", id)
        .maybeSingle();
      return data;
    },
    refetchInterval: (q) => (q.state.data ? false : 3000),
  });

  const c = result.data?.content as any;
  const meta = result.data?.assessments as any;
  const childName = meta?.children?.name ?? "";
  const level = meta?.education_level ?? "TK";

  return (
    <div className="min-h-screen bg-gradient-soft pb-24 md:pb-12">
      <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <GraduationCap className="h-4 w-4" /> Laporan Assessment Jenjang {level}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Hasil Asesmen {childName ? `Ananda ${childName}` : "Anak Anda"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Hasil analisis AI ini merupakan rekomendasi awal sebagai bahan pendampingan di rumah.
          </p>
        </div>

        {!c ? (
          <div className="rounded-3xl border border-border/60 bg-card p-10 text-center shadow-soft">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">AI sedang menganalisis jawaban asesmen jenjang {level}…</p>
          </div>
        ) : (
          <div className="grid gap-5">
            <Section title="1. Ringkasan Assessment"><p>{c.ringkasan}</p></Section>
            <Section title="2. Kelebihan Anak"><List items={c.kelebihan} /></Section>
            <Section title="3. Area yang Perlu Dikembangkan"><List items={c.area_pengembangan} /></Section>
            <Section title="4. Kemampuan Akademik"><p>{c.kemampuan_akademik ?? c.kemampuan_belajar}</p></Section>
            <Section title="5. Kemampuan Sosial"><p>{c.kecerdasan_sosial}</p></Section>
            <Section title="6. Kemampuan Emosional"><p>{c.kecerdasan_emosional}</p></Section>
            <Section title="7. Karakter"><p>{c.karakter ?? "Memiliki karakter pembelajar yang jujur dan tekun."}</p></Section>
            <Section title="8. Potensi"><p>{c.potensi}</p></Section>
            <Section title="9. Minat dan Bakat"><p>{c.minat_bakat ?? "Terlihat minat pada pemecahan masalah dan eksplorasi ilmu baru."}</p></Section>
            <Section title="10. Hal yang Perlu Menjadi Perhatian"><List items={c.perhatian_orangtua} /></Section>
            <Section title="11. Rekomendasi Treatment">
              {Array.isArray(c.treatment) ? (
                <ul className="space-y-3">
                  {c.treatment.map((t: any, i: number) => (
                    <li key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <div className="text-sm font-semibold text-foreground">{t.kategori}</div>
                      <div className="mt-1 text-sm">{t.aktivitas}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{String(c.treatment ?? "")}</p>
              )}
            </Section>
            <Section title="12. Rekomendasi Pengembangan Akademik"><p>{c.rekomendasi_akademik ?? c.kemampuan_akademik}</p></Section>
            <Section title="13. Kesimpulan"><p className="italic">{c.kesimpulan}</p></Section>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
              >
                <Printer className="h-4 w-4" /> Cetak Laporan
              </button>
            </div>
          </div>
        )}
      </div>
      <PublicFooter
        siteName={website.data?.site_name ?? "PAA"}
        copyright={website.data?.copyright}
        contactEmail={website.data?.contact_email}
        contactWhatsapp={website.data?.contact_whatsapp}
      />
    </div>
  );
}