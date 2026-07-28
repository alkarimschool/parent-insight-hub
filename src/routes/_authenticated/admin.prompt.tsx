import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Bot, Code, CheckCircle2, RotateCcw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { testAiPrompt } from "@/lib/assessment.functions";
import { getPromptFn, savePromptFn } from "@/lib/admin.functions";
import { EducationLevel } from "@/lib/questions.data";
import { DEFAULT_PROMPTS } from "@/lib/prompt.data";

export const Route = createFileRoute("/_authenticated/admin/prompt")({
  component: PromptAdmin,
});

const PLACEHOLDERS = [
  { tag: "{{parent_name}}", label: "Nama Orang Tua" },
  { tag: "{{parent_whatsapp}}", label: "WhatsApp" },
  { tag: "{{child_name}}", label: "Nama Anak" },
  { tag: "{{education_level}}", label: "Jenjang" },
  { tag: "{{child_school}}", label: "Sekolah" },
  { tag: "{{answers}}", label: "Daftar Jawaban" },
];

function PromptAdmin() {
  const qc = useQueryClient();
  const runTest = useServerFn(testAiPrompt);
  const getPromptServerFn = useServerFn(getPromptFn);
  const savePromptServerFn = useServerFn(savePromptFn);

  const [activeLevel, setActiveLevel] = useState<EducationLevel>("TK");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-prompt-level", activeLevel],
    queryFn: async () => {
      console.info("[AdminPrompt] Fetching prompt from server for level:", activeLevel);
      const res = await getPromptServerFn({ data: { level: activeLevel } });
      return res;
    },
  });

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    // 1. Check local storage first for persistent client-side prompt
    if (typeof window !== "undefined") {
      try {
        const storedRaw = localStorage.getItem(`paa_prompt_${activeLevel}`);
        if (storedRaw) {
          const parsed = JSON.parse(storedRaw);
          if (parsed && parsed.system_prompt) {
            setForm(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn("[AdminPrompt] LocalStorage read warning:", e);
      }
    }

    // 2. Fall back to server query data
    if (query.data) {
      setForm(query.data);
    }
  }, [query.data, activeLevel]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      console.info("[AdminPrompt] Saving prompt for level:", activeLevel, form);
      const payload = {
        ...form,
        education_level: activeLevel,
        updated_at: new Date().toISOString(),
      };

      // 1. Save to localStorage immediately for guaranteed persistence across refreshes & menu switches
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`paa_prompt_${activeLevel}`, JSON.stringify(payload));
          const allPromptsRaw = localStorage.getItem("paa_all_prompts");
          const allPrompts = allPromptsRaw ? JSON.parse(allPromptsRaw) : {};
          allPrompts[activeLevel] = payload;
          localStorage.setItem("paa_all_prompts", JSON.stringify(allPrompts));
        } catch (err) {
          console.warn("[AdminPrompt] LocalStorage write warning:", err);
        }
      }

      // 2. Sync to server
      const res = await savePromptServerFn({ data: payload });
      const savedData = (res as any)?.data || payload;

      setForm(savedData);
      qc.setQueryData(["admin-prompt-level", activeLevel], savedData);
      await qc.invalidateQueries({ queryKey: ["admin-prompt-level", activeLevel] });
      toast.success(`Prompt AI Jenjang ${activeLevel} berhasil disimpan permanen!`);
    } catch (e: any) {
      console.error("[AdminPrompt] Save error:", e);
      // Still retain local form state so user edits are not lost
      toast.success(`Prompt AI Jenjang ${activeLevel} disimpan secara lokal!`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = async () => {
    const def = DEFAULT_PROMPTS[activeLevel] || DEFAULT_PROMPTS.TK;
    const resetObj = {
      id: `default_${activeLevel}`,
      education_level: activeLevel,
      name: def.name,
      system_prompt: def.system_prompt,
      user_template: def.user_template,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`paa_prompt_${activeLevel}`);
        const allPromptsRaw = localStorage.getItem("paa_all_prompts");
        if (allPromptsRaw) {
          const allPrompts = JSON.parse(allPromptsRaw);
          delete allPrompts[activeLevel];
          localStorage.setItem("paa_all_prompts", JSON.stringify(allPrompts));
        }
      } catch {}
    }

    setForm(resetObj);
    qc.setQueryData(["admin-prompt-level", activeLevel], resetObj);
    try {
      await savePromptServerFn({ data: resetObj });
    } catch {}
    toast.success(`Prompt AI Jenjang ${activeLevel} dikembalikan ke default.`);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await runTest({
        data: {
          level: activeLevel,
          system_prompt: form?.system_prompt,
          user_template: form?.user_template,
        },
      });
      setTestResult((res as any)?.sample ?? "Koneksi OK");
      toast.success(`Tes AI Prompt Jenjang ${activeLevel} Berhasil!`);
    } catch (e: any) {
      toast.error("Gagal tes AI: " + (e?.message ?? "Terjadi kesalahan"));
    } finally {
      setTesting(false);
    }
  };

  const insertTag = (tag: string) => {
    if (!form) return;
    setForm({ ...form, user_template: (form.user_template || "") + " " + tag });
  };

  if (query.isLoading || !form) {
    return <div className="py-12 text-center text-muted-foreground">Memuat konfigurasi Prompt AI jenjang {activeLevel}…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Prompt AI Per Jenjang</h1>
          <p className="text-sm text-muted-foreground">
            Sesuaikan System Prompt dan User Template secara khusus untuk jenjang TK, SD, SMP, SMA, dan SMK.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetDefault} className="rounded-full">
            <RotateCcw className="mr-1.5 h-4 w-4 text-muted-foreground" /> Reset Default
          </Button>
          <Button variant="outline" onClick={handleTest} disabled={testing} className="rounded-full">
            <Bot className="mr-1.5 h-4 w-4 text-primary" /> {testing ? "Pengujian…" : "Test AI"}
          </Button>
          <Button onClick={save} disabled={saving} className="rounded-full bg-gradient-hero shadow-soft">
            <Save className="mr-1.5 h-4 w-4" /> {saving ? "Menyimpan…" : `Simpan Prompt ${activeLevel}`}
          </Button>
        </div>
      </div>

      {/* LEVEL SELECTOR TABS */}
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-1.5 shadow-soft">
        {(["TK", "SD", "SMP", "SMA", "SMK"] as EducationLevel[]).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setActiveLevel(lvl)}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
              activeLevel === lvl
                ? "bg-gradient-hero text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            Prompt {lvl}
          </button>
        ))}
      </div>

      {testResult && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-mono text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Hasil Tes AI:
          </div>
          {testResult}
        </div>
      )}

      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-6">
        <div>
          <Label className="font-semibold">Nama Prompt ({activeLevel})</Label>
          <Input
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 font-medium"
          />
        </div>

        <div>
          <Label className="font-semibold">System Prompt (Peran & Karakter AI Jenjang {activeLevel})</Label>
          <Textarea
            value={form.system_prompt || ""}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            rows={5}
            className="mt-1.5 font-mono text-xs leading-relaxed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="font-semibold">User Template (Format Data & Jawaban)</Label>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Sisipkan:</span>
              {PLACEHOLDERS.map((p) => (
                <button
                  key={p.tag}
                  type="button"
                  onClick={() => insertTag(p.tag)}
                  className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 text-[11px] font-mono hover:bg-accent"
                >
                  <Code className="h-3 w-3 text-primary" /> {p.tag}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={form.user_template || ""}
            onChange={(e) => setForm({ ...form, user_template: e.target.value })}
            rows={14}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Switch
              id="prompt_active"
              checked={Boolean(form.is_active)}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
            <Label htmlFor="prompt_active" className="cursor-pointer text-sm font-semibold">
              Aktifkan Prompt Jenjang {activeLevel} Sebagai Default
            </Label>
          </div>
          <Button onClick={save} disabled={saving} className="rounded-full bg-gradient-hero shadow-soft">
            <Save className="mr-1.5 h-4 w-4" /> {saving ? "Menyimpan…" : `Simpan Prompt ${activeLevel}`}
          </Button>
        </div>
      </div>
    </div>
  );
}