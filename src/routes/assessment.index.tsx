import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchWebsite } from "@/lib/settings";
import { PublicNav } from "@/components/site/PublicNav";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Lock } from "lucide-react";
import { toast } from "sonner";
import { EducationLevel } from "@/lib/questions.data";
import { getAssessmentContent } from "@/lib/assessment-content";
import { fetchAssessmentLocks, LOCK_MESSAGE, firstUnlockedLevel } from "@/lib/locks";
import { getAssessmentLocksFn } from "@/lib/locks.functions";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/assessment/")({
  validateSearch: (search: Record<string, unknown>) => {
    const rawLvl = String(search.level || "").toUpperCase();
    const validLevel = ["TK", "SD", "SMP", "SMA", "SMK"].includes(rawLvl)
      ? (rawLvl as EducationLevel)
      : undefined;
    return {
      level: validLevel,
    };
  },
  head: () => ({
    meta: [
      { title: "Mulai Assessment — Parent Awareness Assessment" },
      { name: "description", content: "Isi data anak dan nomor WhatsApp untuk memulai asesmen perkembangan." },
    ],
  }),
  beforeLoad: async ({ search }: any) => {
    if (!search?.level) return;
    let locks: Record<string, boolean> | undefined;
    try {
      locks = (await getAssessmentLocksFn()) as any;
    } catch (e) {
      console.warn("[LOCK_GUARD] gagal membaca status kunci:", e);
    }
    if (locks?.[search.level] === true) {
      throw redirect({ to: "/assessment/level" });
    }
  },
  component: AssessmentFormPage,
});

const LEVEL_NAMES: Record<EducationLevel, string> = {
  TK: `${getAssessmentContent("TK").icon} ${getAssessmentContent("TK").fullName}`,
  SD: `${getAssessmentContent("SD").icon} ${getAssessmentContent("SD").fullName}`,
  SMP: `${getAssessmentContent("SMP").icon} ${getAssessmentContent("SMP").fullName}`,
  SMA: `${getAssessmentContent("SMA").icon} ${getAssessmentContent("SMA").fullName}`,
};

function AssessmentFormPage() {
  const website = useQuery({ queryKey: ["website"], queryFn: fetchWebsite });
  const locks = useQuery({ queryKey: ["assessment-locks"], queryFn: fetchAssessmentLocks });
  const navigate = useNavigate();
  const search: any = useSearch({ from: "/assessment/" });

  const [form, setForm] = useState<{
    whatsapp: string;
    child_name: string;
    education_level: EducationLevel;
  }>({
    whatsapp: "",
    child_name: "",
    education_level: (search?.level as EducationLevel) || "TK",
  });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("paa_form");
      if (search?.level) {
        setForm((prev) => ({ ...prev, education_level: search.level }));
      } else if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.education_level) {
          setForm((prev) => ({ ...prev, ...parsed, education_level: parsed.education_level }));
        }
      }
    } catch {}
  }, [search]);

  // Fallback to the first unlocked level when the current one is locked (no hardcoded level)
  useEffect(() => {
    if (locks.data && !search?.level && locks.data[form.education_level]) {
      const next = firstUnlockedLevel(locks.data);
      if (next && next !== form.education_level) {
        setForm((prev) => ({ ...prev, education_level: next as EducationLevel }));
      }
    }
  }, [locks.data, search?.level, form.education_level]);

  const isLocked = !!locks.data?.[form.education_level];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      toast.error(LOCK_MESSAGE);
      return;
    }
    if (!form.whatsapp.trim() || !form.child_name.trim()) {
      toast.error("Mohon isi Nomor WhatsApp dan Nama Anak.");
      return;
    }
    try {
      const payload = {
        ...form,
        parent_name: `Orang Tua Ananda ${form.child_name.trim()}`,
        school: "",
      };
      sessionStorage.setItem("paa_form", JSON.stringify(payload));
    } catch {}
    navigate({ to: "/assessment/questions" });
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-24 md:pb-12">
      <PublicNav
        siteName={website.data?.site_name ?? "Parent Awareness Assessment"}
        logoText={website.data?.logo_text ?? "PAA"}
      />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <GraduationCap className="h-4 w-4" /> {LEVEL_NAMES[form.education_level] || "Sekolah Menengah Atas (SMA)"}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">Data Anak & Kontak</h1>
          <p className="mt-2 text-muted-foreground">Isi data anak dan nomor WhatsApp untuk memulai asesmen jenjang {form.education_level}.</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft sm:p-8 space-y-6">
          {/* JENJANG SELECTION BADGE & SELECTOR */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold text-foreground">Jenjang Pendidikan Terpilih *</Label>
              <Link to="/assessment/level" className="text-xs font-semibold text-primary hover:underline">
                Lihat Semua Jenjang
              </Link>
            </div>
            <select
              value={form.education_level}
              onChange={(e) => setForm({ ...form, education_level: e.target.value as EducationLevel })}
              className="w-full rounded-2xl border border-input bg-background p-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="TK">👶 Pendidikan Anak Usia Dini (TK / PAUD) {locks.data?.TK ? "(🔒 Terkunci)" : ""}</option>
              <option value="SD">📘 Sekolah Dasar (SD) {locks.data?.SD ? "(🔒 Terkunci)" : ""}</option>
              <option value="SMP">📗 Sekolah Menengah Pertama (SMP) {locks.data?.SMP ? "(🔒 Terkunci)" : ""}</option>
              <option value="SMA">🎓 Sekolah Menengah Atas (SMA) {locks.data?.SMA ? "(🔒 Terkunci)" : ""}</option>
              <option value="SMK">🛠️ Sekolah Menengah Kejuruan (SMK) {locks.data?.SMK ? "(🔒 Terkunci)" : ""}</option>
            </select>
            {isLocked && (
              <p className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Lock className="h-4 w-4 shrink-0" /> Asesmen {form.education_level} sedang dalam pengembangan. Silakan pilih jenjang lain yang berstatus terbuka.
              </p>
            )}
          </div>

          <div className="grid gap-5">
            <div>
              <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
              <Input
                id="whatsapp"
                placeholder="08xxxxxxxxxx"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="mt-1.5"
                maxLength={30}
                required
              />
            </div>
            <hr className="border-border/60" />
            <div>
              <Label htmlFor="child_name">Nama Anak *</Label>
              <Input
                id="child_name"
                value={form.child_name}
                onChange={(e) => setForm({ ...form, child_name: e.target.value })}
                className="mt-1.5"
                maxLength={120}
                required
                placeholder="Rafathar Malik Ahmad"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 pt-4 border-t border-border/40">
            <Link to="/assessment/level" className="text-sm text-muted-foreground hover:text-foreground">
              ← Pilih Jenjang
            </Link>
            <Button type="submit" size="lg" disabled={isLocked} className="rounded-full bg-gradient-hero shadow-soft">
              {isLocked ? (
                <>
                  <Lock className="mr-1.5 h-4 w-4" /> Asesmen {form.education_level} Terkunci
                </>
              ) : (
                <>
                  Lanjut Assessment {form.education_level} <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
