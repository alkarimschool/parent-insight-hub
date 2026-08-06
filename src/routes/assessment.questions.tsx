import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PublicNav } from "@/components/site/PublicNav";
import { fetchWebsite } from "@/lib/settings";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, GraduationCap, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { submitAssessment } from "@/lib/assessment.functions";
import { useServerFn } from "@tanstack/react-start";
import { LEVEL_QUESTIONS, EducationLevel } from "@/lib/questions.data";
import { fetchAssessmentLocks, LOCK_MESSAGE } from "@/lib/locks";
import { toast } from "sonner";

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
  const locks = useQuery({ queryKey: ["assessment-locks"], queryFn: fetchAssessmentLocks, staleTime: 0, refetchOnMount: "always" });
  const submit = useServerFn(submitAssessment);

  const [formData, setFormData] = useState<any>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("paa_form");
      if (!raw) {
        setFormData({ education_level: "SMA", parent_name: "Orang Tua", child_name: "Siswa SMA", whatsapp: "08123456789" });
        return;
      }
      const parsed = JSON.parse(raw);
      if (locks.data && locks.data[parsed.education_level] && !locks.data["SMA"]) {
        parsed.education_level = "SMA";
        sessionStorage.setItem("paa_form", JSON.stringify(parsed));
      }
      setFormData(parsed);
    } catch {
      setFormData({ education_level: "SMA", parent_name: "Orang Tua", child_name: "Siswa SMA", whatsapp: "08123456789" });
    }
  }, [navigate, locks.data]);

  const level: EducationLevel = (formData?.education_level || "SMA") as EducationLevel;
  const isLocked = !!locks.data?.[level];

  useEffect(() => {
    if (locks.data && isLocked && level !== "SMA") {
      toast.error(LOCK_MESSAGE);
      navigate({ to: "/assessment", search: { level: "SMA" } as any });
    }
  }, [locks.data, isLocked, level, navigate]);

  const { data: dbCats } = useQuery({
    queryKey: ["assessment_categories", level],
    queryFn: async () => {
      const { data } = await supabase.from("question_categories").select("*").eq("education_level", level).order("order_index");
      return (data || []) as CatRow[];
    },
  });

  const { data: dbQs, isLoading } = useQuery({
    queryKey: ["assessment_questions", level],
    queryFn: async () => {
      const { data } = await supabase.from("questions").select("*").eq("education_level", level).order("order_index");
      return (data || []) as QRow[];
    },
  });

  const list = useMemo(() => {
    if (dbQs && dbQs.length > 0) {
      if (level === "SMA" && dbQs.length !== 40) {
        return LEVEL_QUESTIONS.SMA;
      }
      return dbQs;
    }
    return LEVEL_QUESTIONS[level] || LEVEL_QUESTIONS.TK;
  }, [dbQs, level]);

  const cats = useMemo(() => {
    return dbCats || [];
  }, [dbCats]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (topRef.current) {
          topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 20);
    });
  };

  const handleNext = () => {
    if (idx < list.length - 1) {
      setIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (idx > 0) {
      setIdx((prev) => prev - 1);
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [idx]);

  useEffect(() => {
    try {
      if (!level) return;
      const saved = localStorage.getItem(`paa_answers_${level}`);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {}
  }, [level]);

  useEffect(() => {
    try {
      if (level) localStorage.setItem(`paa_answers_${level}`, JSON.stringify(answers));
    } catch {}
  }, [answers, level]);

  const current = list[idx] as any;
  const categoryName = useMemo(() => {
    if (!current) return "";
    if (current.category_name) return current.category_name;
    const cat = (cats as CatRow[]).find((c) => c.id === (current as QRow).category_id);
    return cat?.name ?? "Umum";
  }, [cats, current]);

  const answered = list.filter((q: any) => {
    const val = answers[q.id];
    if (q.type === "textarea") return typeof val === "string" && val.trim().length > 0;
    return val !== undefined && val !== null && val !== "";
  }).length;
  const progress = list.length ? (answered / list.length) * 100 : 0;

  const handleSubmit = async () => {
    if (isLocked) {
      toast.error(LOCK_MESSAGE);
      return;
    }
    if (!formData || !formData.whatsapp?.trim() || !formData.child_name?.trim()) {
      toast.error("Data anak/WhatsApp belum lengkap. Silakan kembali ke pengisian data.");
      navigate({ to: "/assessment", search: { level: undefined } });
      return;
    }
    if (answered < list.length) {
      toast.error("Silakan lengkapi seluruh pertanyaan sebelum mengirim assessment.");
      return;
    }
    if (submitting) return;

    const parentName = formData.parent_name?.trim() || `Orang Tua Ananda ${formData.child_name.trim()}`;

    setSubmitting(true);
    console.log("[STAGE 1: FRONTEND_SUBMIT_START]", {
      level,
      parentName,
      childName: formData.child_name.trim(),
      answersCount: list.length,
    });

    try {
      const payloadAnswers = list.map((q: any) => {
        const isTextarea = q.type === "textarea";
        const rawVal = answers[q.id];
        if (isTextarea) {
          return {
            question_id: String(q.id),
            score: 5,
            text_answer: String(rawVal ?? "").trim(),
          };
        }
        const scoreNum = typeof rawVal === "number" ? rawVal : 3;
        const matchedOpt = q.options?.find((o: any) => o.v === scoreNum);
        return {
          question_id: String(q.id),
          score: scoreNum,
          text_answer: matchedOpt?.label || "",
        };
      });

      console.log("[STAGE 2: PAYLOAD_SENT_TO_SERVER_FN]", { answersCount: payloadAnswers.length });

      const res = await submit({
        data: {
          parent: { name: parentName, whatsapp: formData.whatsapp.trim() },
          child: {
            name: formData.child_name.trim(),
            gender: formData.gender || "L",
            birth_date: formData.birth_date || "2020-01-01",
            school: formData.school || "",
            class_name: formData.class_name || "",
            education_level: level,
          },
          answers: payloadAnswers,
        },
      });

      console.log("[STAGE 7: FRONTEND_RESPONSE_RECEIVED]", res);

      if (!res || !res.assessment_id) {
        throw new Error("Gagal menerima ID Assessment dari server.");
      }

      localStorage.removeItem(`paa_answers_${level}`);
      sessionStorage.removeItem("paa_form");
      toast.success("✅ Assessment berhasil dikirim!");

      console.log("[STAGE 8: FRONTEND_NAVIGATING]", "/assessment/submitted");
      await navigate({ to: "/assessment/submitted" });
    } catch (e: any) {
      console.error("[STAGE: FRONTEND_SUBMIT_ERROR]", e);
      const msg =
        typeof e === "string"
          ? e
          : e?.message || e?.data?.message || "Gagal mengirim assessment. Silakan coba beberapa saat lagi.";
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">Memuat pertanyaan assessment {level}…</div>
      </div>
    );
  }
  if (!current) return null;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
        <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-muted text-muted-foreground">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
            Asesmen {level} Sedang Dalam Pengembangan
          </h1>
          <p className="mt-3 text-muted-foreground">{LOCK_MESSAGE}</p>
          <Link to="/assessment/level" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft">
            Pilih Jenjang Lain <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const currentOptions = current.options || SCALE;
  const isCurrentTextarea = current.type === "textarea";

  return (
    <div className="min-h-screen bg-gradient-soft pb-16 md:pb-12">
      <PublicNav siteName={website.data?.site_name ?? "PAA"} logoText="PAA" />
      <div className="mx-auto max-w-2xl px-3.5 py-4 sm:px-6 sm:py-8">
        <div ref={topRef} className="mb-3.5 sm:mb-5 scroll-mt-16">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 font-bold text-primary truncate max-w-[70%]">
              <GraduationCap className="h-4 w-4 shrink-0" /> Jenjang {level} — {categoryName}
            </span>
            <span className="text-muted-foreground font-semibold shrink-0">{idx + 1} / {list.length}</span>
          </div>
          <Progress value={progress} className="mt-1.5 h-1.5 sm:h-2" />
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-4 sm:p-7 md:p-8 shadow-soft">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
            Pertanyaan {idx + 1} ({level})
          </div>
          <h2 className="mt-1.5 text-base sm:text-xl font-bold leading-snug sm:leading-relaxed text-foreground">{current.text}</h2>
          
          {isCurrentTextarea ? (
            <div className="mt-4">
              <Textarea
                value={answers[current.id] ?? ""}
                onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
                placeholder="Tuliskan pengamatan atau penjelasan Anda di sini..."
                className="min-h-[100px] sm:min-h-[130px] rounded-xl sm:rounded-2xl border-border/60 bg-background p-3 text-sm focus:border-primary"
              />
            </div>
          ) : (
            <div className="mt-4 sm:mt-6 grid gap-2 sm:gap-2.5">
              {currentOptions.map((s: any, optIdx: number) => {
                const selected = answers[current.id] === s.v;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [current.id]: s.v })}
                    className={"flex items-center justify-between rounded-xl sm:rounded-2xl border px-3.5 py-2.5 sm:p-3.5 text-left transition active:scale-[0.99] " + (selected ? "border-primary bg-primary/10 shadow-soft" : "border-border/60 bg-background hover:border-primary/40 hover:bg-accent/40")}
                  >
                    <span className="text-xs sm:text-sm font-medium text-foreground leading-tight pr-2">{s.label}</span>
                    <span className={"grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-full text-xs sm:text-sm font-bold ml-2 " + (selected ? "bg-gradient-hero text-primary-foreground" : "bg-muted text-muted-foreground")}>{s.v}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5 sm:mt-7 flex items-center justify-between gap-2.5">
            <Button type="button" variant="outline" onClick={handlePrev} disabled={idx === 0} className="rounded-full h-9 sm:h-10 px-3.5 text-xs sm:text-sm">
              <ArrowLeft className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Sebelumnya
            </Button>
            {idx < list.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={!answers[current.id]} className="rounded-full bg-gradient-hero shadow-soft h-9 sm:h-10 px-4 text-xs sm:text-sm font-semibold">
                Selanjutnya <ArrowRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitting || answered < list.length} className="rounded-full bg-gradient-hero shadow-soft px-5 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm font-bold">
                {submitting ? (<><Loader2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> Mengirim...</>) : "Submit Assessment"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3.5 text-center text-[11px] sm:text-xs text-muted-foreground">
          Jawaban tersimpan otomatis. <Link to="/assessment" search={{ level: undefined }} className="underline">Kembali ke data</Link>
        </div>
      </div>
    </div>
  );
}