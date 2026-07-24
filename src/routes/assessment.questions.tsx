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

interface QRow { id: string; text: string; order_index: number; category_id: string | null }
interface CatRow { id: string; name: string; order_index: number }

const SCALE = [
  { v: 5, label: "Selalu" },
  { v: 4, label: "Sering" },
  { v: 3, label: "Kadang-kadang" },
  { v: 2, label: "Jarang" },
  { v: 1, label: "Tidak Pernah" },
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
      const [{ data: qs }, { data: cats }] = await Promise.all([
        supabase.from("questions").select("id,text,order_index,category_id,is_active").eq("is_active", true).order("order_index"),
        supabase.from("question_categories").select("id,name,order_index").order("order_index"),
      ]);
      return { qs: (qs ?? []) as QRow[], cats: (cats ?? []) as CatRow[] };
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
            gender: formData.gender,
            birth_date: formData.birth_date,
            school: formData.school,
            class_name: formData.class_name,
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
    <div className="min-h-screen bg-gradient-soft">
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
            {SCALE.map((s) => {
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