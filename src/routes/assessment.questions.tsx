import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicNav } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitAssessment } from "@/lib/assessment.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/assessment/questions")({
  head: () => ({ meta: [{ title: "Pertanyaan Assessment" }] }),
  component: QuestionsPage,
});

interface CatRow { id: string; name: string; order_index: number }
interface QRow { id: string; category_id: string; text: string; order_index: number }

const DEFAULT_CATS: CatRow[] = [
  { id: "c1", name: "Komunikasi", order_index: 1 },
  { id: "c2", name: "Sosial dan Emosional", order_index: 2 },
  { id: "c3", name: "Kemandirian", order_index: 3 },
  { id: "c4", name: "Belajar dan Konsentrasi", order_index: 4 },
  { id: "c5", name: "Kemampuan Akademik Awal", order_index: 5 },
  { id: "c6", name: "Perilaku dan Potensi", order_index: 6 },
];

const DEFAULT_QUESTIONS: QRow[] = [
  { id: "q1", category_id: "c1", text: "Apakah anak mampu menyampaikan keinginan, pendapat, atau perasaannya dengan jelas kepada orang lain?", order_index: 1 },
  { id: "q2", category_id: "c1", text: "Ketika diberikan arahan sederhana, apakah anak dapat memahami dan melakukannya dengan baik?", order_index: 2 },
  { id: "q3", category_id: "c1", text: "Apakah anak berani bertanya, menjawab pertanyaan, atau bercerita kepada orang lain?", order_index: 3 },
  { id: "q4", category_id: "c2", text: "Apakah anak mudah bermain dan bergaul dengan teman-teman seusianya?", order_index: 4 },
  { id: "q5", category_id: "c2", text: "Saat menghadapi kekecewaan, apakah anak mampu mengendalikan emosinya tanpa marah atau menangis berlebihan?", order_index: 5 },
  { id: "q6", category_id: "c2", text: "Apakah anak menunjukkan rasa peduli, seperti membantu atau menghibur orang lain yang sedang sedih atau kesulitan?", order_index: 6 },
  { id: "q7", category_id: "c3", text: "Apakah anak mampu melakukan kegiatan sehari-hari seperti makan, memakai pakaian, atau merapikan mainan secara mandiri?", order_index: 7 },
  { id: "q8", category_id: "c3", text: "Apakah anak terbiasa menjaga dan merapikan barang-barang miliknya setelah digunakan?", order_index: 8 },
  { id: "q9", category_id: "c3", text: "Apakah anak berani mencoba aktivitas atau pengalaman baru tanpa harus selalu didampingi orang tua?", order_index: 9 },
  { id: "q10", category_id: "c4", text: "Apakah anak mampu berkonsentrasi mengikuti kegiatan atau bermain selama sekitar 10–15 menit?", order_index: 10 },
  { id: "q11", category_id: "c4", text: "Apakah anak sering menunjukkan rasa ingin tahu dengan bertanya atau mencoba hal-hal baru?", order_index: 11 },
  { id: "q12", category_id: "c4", text: "Apakah anak tetap berusaha menyelesaikan tugas atau permainan meskipun mengalami kesulitan?", order_index: 12 },
  { id: "q13", category_id: "c5", text: "Apakah anak mampu mengenal huruf dasar, angka, warna, bentuk, atau membilang/berhitung benda sederhana sesuai usianya?", order_index: 13 },
  { id: "q14", category_id: "c5", text: "Apakah anak tertarik dan mulai mampu membaca kata pendek, menulis/mencoret huruf, atau mengelompokkan benda sesuai jumlahnya?", order_index: 14 },
  { id: "q15", category_id: "c5", text: "Apakah anak mampu mengenali pola sederhana (seperti urutan warna/bentuk) atau menyelesaikan puzzle dan permainan logika seusianya?", order_index: 15 },
  { id: "q16", category_id: "c5", text: "Apakah anak mampu mengingat dan menceritakan kembali cerita pendek, lirik lagu, atau informasi belajar yang pernah disampaikan?", order_index: 16 },
  { id: "q17", category_id: "c5", text: "Apakah anak menunjukkan ketelitian dan rasa ingin tahu saat belajar kosa kata baru, konsep ukuran (besar/kecil), atau perbandingan jumlah (banyak/sedikit)?", order_index: 17 },
  { id: "q18", category_id: "c6", text: "Apakah anak mampu mengikuti aturan yang berlaku di rumah maupun di sekolah tanpa harus selalu diingatkan?", order_index: 18 },
  { id: "q19", category_id: "c6", text: "Apakah anak sering menunjukkan ketertarikan yang kuat terhadap aktivitas tertentu, seperti menggambar, bernyanyi, menari, berhitung, olahraga, atau kegiatan kreatif lainnya?", order_index: 19 },
  { id: "q20", category_id: "c6", text: "Menurut Anda, apakah perkembangan anak saat ini sudah sesuai dengan usianya?", order_index: 20 },
];

const SCALE = [
  { v: 5, label: "Selalu" },
  { v: 4, label: "Sering" },
  { v: 3, label: "Kadang-kadang" },
  { v: 2, label: "Jarang" },
  { v: 1, label: "Tidak Pernah" },
];

const SCALE_Q15 = [
  { v: 5, label: "Sangat Sesuai" },
  { v: 4, label: "Sesuai" },
  { v: 3, label: "Cukup Sesuai" },
  { v: 2, label: "Kurang Sesuai" },
  { v: 1, label: "Belum Sesuai" },
];

function QuestionsPage() {
  const navigate = useNavigate();
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const submit = useServerFn(submitAssessment);

  const [formData, setFormData] = useState<any>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("paa_form");
      if (!raw) { navigate({ to: "/assessment" }); return; }
      setFormData(JSON.parse(raw));
    } catch { navigate({ to: "/assessment" }); }
  }, [navigate]);

  const questions = useQuery({
    queryKey: ["questions-active"],
    queryFn: async () => {
      try {
        const [{ data: qs }, { data: cats }] = await Promise.all([
          supabase.from("questions").select("id,text,order_index,category_id,is_active").eq("is_active", true).order("order_index"),
          supabase.from("question_categories").select("id,name,order_index").order("order_index"),
        ]);
        if (qs && qs.length > 0) {
          return { qs: qs as QRow[], cats: (cats ?? []) as CatRow[] };
        }
      } catch (e) {
        console.warn("Using default questions fallback", e);
      }
      return { qs: DEFAULT_QUESTIONS, cats: DEFAULT_CATS };
    },
  });

  const list = questions.data?.qs ?? [];
  const cats = questions.data?.cats ?? [];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem("paa_answers"); if (raw) setAnswers(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("paa_answers", JSON.stringify(answers)); } catch {}
  }, [answers]);

  const current = list[idx];
  const cat = useMemo(() => cats.find((c) => c.id === current?.category_id), [cats, current]);
  const answered = list.filter((q) => answers[q.id]).length;
  const progress = list.length ? (answered / list.length) * 100 : 0;

  const isSpecialScale = current?.order_index === 20 || current?.text.includes("sesuai dengan usianya");

  const handleSubmit = async () => {
    if (answered < list.length) { toast.error("Mohon isi semua pertanyaan."); return; }
    if (!formData) return;
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          parent: { name: formData.parent_name, whatsapp: formData.whatsapp },
          child: {
            name: formData.child_name,
            gender: formData.gender || "L",
            birth_date: formData.birth_date || "2020-01-01",
            school: formData.school || "",
            class_name: formData.class_name || "",
          },
          answers: list.map((q) => ({ question_id: q.id, score: answers[q.id] })),
        },
      });
      localStorage.removeItem("paa_answers");
      sessionStorage.removeItem("paa_form");
      toast.success("Assessment berhasil dianalisis!");
      navigate({ to: "/assessment/result/$id", params: { id: res.assessment_id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal menyimpan assessment.");
      setSubmitting(false);
    }
  };

  if (questions.isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">Memuat pertanyaan…</div>
      </div>
    );
  }
  if (!current) return null;

  return (
    <div className="min-h-screen bg-gradient-soft pb-24 md:pb-12">
      <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-primary">{cat?.name ?? ""}</span>
            <span className="text-muted-foreground">{idx + 1} / {list.length}</span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Pertanyaan {idx + 1}</div>
          <h2 className="mt-2 text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">{current.text}</h2>
          <div className="mt-8 grid gap-3">
            {(isSpecialScale ? SCALE_Q15 : SCALE).map((s) => {
              const selected = answers[current.id] === s.v;
              return (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [current.id]: s.v })}
                  className={"flex items-center justify-between rounded-2xl border p-4 text-left transition " + (selected ? "border-primary bg-primary/5 shadow-soft" : "border-border/60 bg-background hover:border-primary/40 hover:bg-accent/40")}
                >
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className={"grid h-8 w-8 place-items-center rounded-full text-sm font-bold " + (selected ? "bg-gradient-hero text-primary-foreground" : "bg-muted text-muted-foreground")}>{s.v}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="rounded-full">
              <ArrowLeft className="mr-1 h-4 w-4" /> Sebelumnya
            </Button>
            {idx < list.length - 1 ? (
              <Button type="button" onClick={() => setIdx(idx + 1)} disabled={!answers[current.id]} className="rounded-full bg-gradient-hero shadow-soft">
                Selanjutnya <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitting || answered < list.length} className="rounded-full bg-gradient-hero shadow-soft">
                {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis…</>) : "Submit Assessment"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Jawaban Anda tersimpan otomatis. <Link to="/assessment" className="underline">Kembali ke data</Link>
        </div>
      </div>
    </div>
  );
}