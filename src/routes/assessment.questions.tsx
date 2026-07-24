import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicNav } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { submitAssessment } from "@/lib/assessment.functions";
import { useServerFn } from "@tanstack/react-start";
import { LEVEL_QUESTIONS, EducationLevel } from "@/lib/questions.data";

export const Route = createFileRoute("/assessment/questions")({
  head: () => ({ meta: [{ title: "Pertanyaan Assessment" }] }),
  component: QuestionsPage,
});

interface CatRow { id: string; name: string; order_index: number; education_level?: string }
interface QRow { id: string; category_id?: string; category_name?: string; text: string; order_index: number; education_level?: string }

const SCALE = [
  { v: 5, label: "Selalu / Sangat Sesuai" },
  { v: 4, label: "Sering / Sesuai" },
  { v: 3, label: "Kadang-kadang / Cukup" },
  { v: 2, label: "Jarang / Kurang" },
  { v: 1, label: "Tidak Pernah / Belum Sesuai" },
];

function QuestionsPage() {
  const navigate = useNavigate();
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const submit = useServerFn(submitAssessment);

  const [formData, setFormData] = useState<any>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("paa_form");
      if (!raw) { navigate({ to: "/assessment/level" }); return; }
      setFormData(JSON.parse(raw));
    } catch { navigate({ to: "/assessment/level" }); }
  }, [navigate]);

  const level: EducationLevel = (formData?.education_level as EducationLevel) || "TK";

  const questions = useQuery({
    queryKey: ["questions-active-level", level],
    queryFn: async () => {
      try {
        const [{ data: qs }, { data: cats }] = await Promise.all([
          supabase
            .from("questions")
            .select("id,text,order_index,category_id,is_active,education_level")
            .eq("is_active", true)
            .eq("education_level", level)
            .order("order_index"),
          supabase
            .from("question_categories")
            .select("id,name,order_index,education_level")
            .order("order_index"),
        ]);

        if (qs && qs.length > 0) {
          return { qs: qs as QRow[], cats: (cats ?? []) as CatRow[] };
        }
      } catch (e) {
        console.warn("Using default questions fallback for level: " + level, e);
      }

      // Fallback data for level
      const defaults = LEVEL_QUESTIONS[level] || LEVEL_QUESTIONS.TK;
      return {
        qs: defaults.map((q) => ({
          id: q.id,
          text: q.text,
          order_index: q.order_index,
          category_name: q.category_name,
          education_level: q.education_level,
        })),
        cats: [],
      };
    },
  });

  const list = questions.data?.qs ?? [];
  const cats = questions.data?.cats ?? [];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`paa_answers_${level}`);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, [level]);

  useEffect(() => {
    try {
      if (level) localStorage.setItem(`paa_answers_${level}`, JSON.stringify(answers));
    } catch {}
  }, [answers, level]);

  const current = list[idx];
  const categoryName = useMemo(() => {
    if (!current) return "";
    if (current.category_name) return current.category_name;
    const cat = cats.find((c) => c.id === current.category_id);
    return cat?.name ?? "Umum";
  }, [cats, current]);

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
            gender: formData.gender || "L",
            birth_date: formData.birth_date || "2020-01-01",
            school: formData.school || "",
            class_name: formData.class_name || "",
            education_level: level,
          },
          answers: list.map((q) => ({ question_id: q.id, score: answers[q.id] })),
        },
      });
      localStorage.removeItem(`paa_answers_${level}`);
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
        <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">Memuat pertanyaan assessment {level}…</div>
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
            <span className="flex items-center gap-1.5 font-bold text-primary">
              <GraduationCap className="h-4 w-4" /> Jenjang {level} — {categoryName}
            </span>
            <span className="text-muted-foreground">{idx + 1} / {list.length}</span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            Pertanyaan {idx + 1} ({level})
          </div>
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
                {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menganalisis {level}…</>) : "Submit Assessment"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Jawaban tersimpan otomatis. <Link to="/assessment" className="underline">Kembali ke data</Link>
        </div>
      </div>
    </div>
  );
}