import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import { CheckCircle2, Sparkles, Home, GraduationCap, Printer } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getAssessmentResultFn } from "@/lib/assessment.functions";

export const Route = createFileRoute("/assessment/result/$id")({
  head: () => ({ meta: [{ title: "Hasil Assessment" }, { name: "robots", content: "noindex" }] }),
  component: ResultPage,
});

interface LevelMeta {
  icon: string;
  badge: string;
  title: string;
  header: (child: string) => string;
  description: string;
  sec4: string;
  sec12: string;
}

const LEVEL_TEMPLATES: Record<string, LevelMeta> = {
  TK: {
    icon: "👶",
    badge: "Laporan Assessment Perkembangan Anak Usia Dini",
    title: "Assessment Perkembangan Anak Usia Dini",
    header: (c) => `Assessment Perkembangan Anak Usia Dini ${c ? `Ananda ${c}` : ""}`,
    description: "Hasil analisis perkembangan anak usia dini sebagai panduan stimulasi, kesiapan sekolah, dan kemampuan akademik awal.",
    sec4: "4. Kemampuan Akademik Awal & Calistung TK",
    sec12: "12. Rekomendasi Stimulasi Calistung & Kesiapan Sekolah",
  },
  SD: {
    icon: "📘",
    badge: "Laporan Assessment Siswa Sekolah Dasar",
    title: "Assessment Karakter dan Potensi Siswa Sekolah Dasar",
    header: (c) => `Assessment Karakter dan Potensi Siswa Sekolah Dasar ${c ? `Ananda ${c}` : ""}`,
    description: "Hasil analisis karakter, kemampuan akademik, kebiasaan belajar, potensi, dan perkembangan sosial emosional siswa Sekolah Dasar.",
    sec4: "4. Kemampuan Akademik (Literasi & Numerasi SD)",
    sec12: "12. Rekomendasi Penguatan Literasi & Numerasi SD",
  },
  SMP: {
    icon: "📗",
    badge: "Laporan Assessment Remaja Awal",
    title: "Assessment Karakter dan Perkembangan Remaja Awal",
    header: (c) => `Assessment Karakter dan Perkembangan Remaja Awal ${c ? `Ananda ${c}` : ""}`,
    description: "Hasil analisis karakter, kemampuan akademik, perkembangan remaja, motivasi belajar, hubungan sosial, dan potensi peserta didik SMP.",
    sec4: "4. Kemampuan Akademik & Berpikir Kritis SMP",
    sec12: "12. Rekomendasi Pengembangan Akademik & Remaja SMP",
  },
  SMA: {
    icon: "🎓",
    badge: "Laporan Assessment Minat dan Kesiapan Masa Depan",
    title: "Assessment Minat, Bakat, dan Kesiapan Masa Depan",
    header: (c) => `Assessment Minat, Bakat, dan Kesiapan Masa Depan ${c ? `Ananda ${c}` : ""}`,
    description: "Hasil analisis kemampuan akademik, minat bakat, kesiapan kuliah, kesiapan karier, kepemimpinan, dan pengembangan diri peserta didik SMA.",
    sec4: "4. Kemampuan Analitis & Kesiapan Perguruan Tinggi",
    sec12: "12. Rekomendasi Strategi Kuliah & Dunia Karier",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft print:border-gray-300 print:shadow-none">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground print:text-black">
        <Sparkles className="h-4 w-4 text-primary print:hidden" />
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground print:text-black">{children}</div>
    </div>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items?.length) return <p className="italic text-muted-foreground print:text-gray-500">Tidak ada catatan spesifik.</p>;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-foreground print:text-black">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary print:text-black" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function ResultPage() {
  const { id } = Route.useParams();
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const getResult = useServerFn(getAssessmentResultFn);

  const result = useQuery({
    queryKey: ["assessment-report-result", id],
    queryFn: async () => {
      const res = await getResult({ data: { id } });
      return res;
    },
    refetchInterval: (q) => (q.state.data ? false : 2000),
  });

  const data = result.data;
  const c = data?.content as any;
  const childName = data?.child_name ?? "Anak";
  const parentName = data?.parent_name ?? "Orang Tua";
  const level = (data?.education_level ?? "TK") as string;
  const meta = LEVEL_TEMPLATES[level] || LEVEL_TEMPLATES.TK;

  return (
    <div className="min-h-screen bg-gradient-soft pb-24 md:pb-12 print:bg-white print:pb-0">
      <div className="print:hidden">
        <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 print:px-0 print:py-4">
        <div className="mb-8 text-center print:mb-6">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary print:bg-transparent print:p-0 print:text-black">
            <span className="print:hidden">{meta.icon}</span> <GraduationCap className="h-4 w-4 print:hidden" /> {meta.badge}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl print:mt-2 print:text-2xl print:text-black">
            {meta.header(childName)}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base print:text-xs print:text-gray-700">
            {meta.description}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs font-medium text-muted-foreground print:text-gray-800">
            <span>Orang Tua: <strong className="text-foreground print:text-black">{parentName}</strong></span>
            <span>•</span>
            <span>Jenjang: <strong className="text-foreground print:text-black">{level}</strong></span>
            {data?.created_at && (
              <>
                <span>•</span>
                <span>Tanggal: <strong className="text-foreground print:text-black">{new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong></span>
              </>
            )}
          </div>
        </div>

        {result.isLoading || !c ? (
          <div className="rounded-3xl border border-border/60 bg-card p-10 text-center shadow-soft">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-foreground">AI sedang menyusun laporan analisis 13 bagian khusus jenjang {level}…</p>
          </div>
        ) : (
          <div className="grid gap-5">
            <Section title="1. Ringkasan Assessment"><p>{c.ringkasan}</p></Section>
            <Section title="2. Kelebihan Anak"><List items={c.kelebihan} /></Section>
            <Section title="3. Area yang Perlu Dikembangkan"><List items={c.area_pengembangan} /></Section>
            <Section title={meta.sec4}><p>{c.kemampuan_akademik ?? c.kemampuan_belajar}</p></Section>
            <Section title="5. Kemampuan Sosial"><p>{c.kecerdasan_sosial}</p></Section>
            <Section title="6. Kemampuan Emosional"><p>{c.kecerdasan_emosional}</p></Section>
            <Section title="7. Karakter"><p>{c.karakter ?? "Memiliki karakter pembelajar yang jujur, disiplin, dan bertanggung jawab."}</p></Section>
            <Section title="8. Potensi"><p>{c.potensi}</p></Section>
            <Section title="9. Minat dan Bakat"><p>{c.minat_bakat ?? "Terlihat minat pada pemecahan masalah dan eksplorasi ilmu pengetahuan."}</p></Section>
            <Section title="10. Hal yang Perlu Menjadi Perhatian"><List items={c.perhatian_orangtua} /></Section>
            <Section title="11. Rekomendasi Treatment">
              {Array.isArray(c.treatment) ? (
                <ul className="space-y-3">
                  {c.treatment.map((t: any, i: number) => (
                    <li key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3 print:border-gray-300">
                      <div className="text-sm font-semibold text-foreground print:text-black">{t.kategori}</div>
                      <div className="mt-1 text-sm text-muted-foreground print:text-gray-800">{t.aktivitas}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{String(c.treatment ?? "")}</p>
              )}
            </Section>
            <Section title={meta.sec12}><p>{c.rekomendasi_akademik ?? c.kemampuan_akademik}</p></Section>
            <Section title="13. Kesimpulan"><p className="italic font-medium text-foreground print:text-black">{c.kesimpulan}</p></Section>

            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
              >
                <Printer className="h-4 w-4" /> Cetak / Export PDF ({level})
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="print:hidden">
        <PublicFooter
          siteName={website.data?.site_name ?? "PAA"}
          copyright={website.data?.copyright}
          contactEmail={website.data?.contact_email}
          contactWhatsapp={website.data?.contact_whatsapp}
        />
      </div>
    </div>
  );
}