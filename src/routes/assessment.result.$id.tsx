import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { PublicNav, PublicFooter } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import { CheckCircle2, Sparkles, Home, GraduationCap, Printer } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getAssessmentResultFn } from "@/lib/assessment.functions";
import { getAssessmentContent } from "@/lib/assessment-content";

export const Route = createFileRoute("/assessment/result/$id")({
  head: () => ({ meta: [{ title: "Hasil Assessment" }, { name: "robots", content: "noindex" }] }),
  component: ResultPage,
});

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
  const level = (data?.education_level || c?.shortName || c?.education_level || "TK") as string;
  const content = getAssessmentContent(level);

  // Synchronize dynamic metadata (title, description, Open Graph, Twitter metadata)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const pageTitle = content.getMetaTitle(childName);
      document.title = `${pageTitle} | ${website.data?.site_name ?? "Parent Insight Hub"}`;

      const setMeta = (nameOrProp: string, val: string, isProp = false) => {
        let el = document.querySelector(isProp ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`);
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute(isProp ? "property" : "name", nameOrProp);
          document.head.appendChild(el);
        }
        el.setAttribute("content", val);
      };

      setMeta("description", content.description);
      setMeta("og:title", pageTitle, true);
      setMeta("og:description", content.description, true);
      setMeta("og:type", "article", true);
      setMeta("twitter:title", pageTitle);
      setMeta("twitter:description", content.description);
      setMeta("twitter:card", "summary_large_image");
    }
  }, [childName, level, content, website.data?.site_name]);

  return (
    <div className="min-h-screen bg-gradient-soft pb-24 md:pb-12 print:bg-white print:pb-0">
      <div className="print:hidden">
        <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 print:px-0 print:py-4">
        {/* Dynamic Badge, H1, Description, Metadata */}
        <div className="mb-8 text-center print:mb-6">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary print:bg-transparent print:p-0 print:text-black">
            <span className="print:hidden">{content.icon}</span> <GraduationCap className="h-4 w-4 print:hidden" /> {content.badge}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl print:mt-2 print:text-2xl print:text-black">
            {content.getHeader(childName)}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base print:text-xs print:text-gray-700">
            {content.description}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs font-medium text-muted-foreground print:text-gray-800">
            <span>Nama Anak: <strong className="text-foreground print:text-black">{childName}</strong></span>
            <span>•</span>
            <span>Jenjang: <strong className="text-foreground print:text-black">{content.shortName} ({content.fullName})</strong></span>
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
            <p className="mt-4 text-sm font-semibold text-foreground">AI sedang menyusun laporan analisis 13 bagian khusus jenjang {content.shortName}…</p>
          </div>
        ) : (
          <div className="grid gap-5">
            <Section title={content.sections.s1}><p>{c.ringkasan}</p></Section>
            <Section title={content.sections.s2}><List items={c.kelebihan} /></Section>
            <Section title={content.sections.s3}><List items={c.area_pengembangan} /></Section>
            <Section title={content.sections.s4}><p>{c.kemampuan_akademik ?? c.kemampuan_belajar}</p></Section>
            <Section title={content.sections.s5}><p>{c.kecerdasan_sosial}</p></Section>
            <Section title={content.sections.s6}><p>{c.kecerdasan_emosional}</p></Section>
            <Section title={content.sections.s7}><p>{c.karakter ?? "Memiliki karakter pembelajar yang jujur, disiplin, dan bertanggung jawab."}</p></Section>
            <Section title={content.sections.s8}><p>{c.potensi}</p></Section>
            <Section title={content.sections.s9}><p>{c.minat_bakat ?? "Terlihat minat pada pemecahan masalah dan eksplorasi ilmu pengetahuan."}</p></Section>
            <Section title={content.sections.s10}><List items={c.perhatian_orangtua} /></Section>
            <Section title={content.sections.s11}>
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
            <Section title={content.sections.s12}><p>{c.rekomendasi_akademik ?? c.kemampuan_akademik}</p></Section>
            <Section title={content.sections.s13}><p className="italic font-medium text-foreground print:text-black">{c.kesimpulan}</p></Section>

            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
              >
                <Printer className="h-4 w-4" /> Cetak / Export PDF ({content.shortName})
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