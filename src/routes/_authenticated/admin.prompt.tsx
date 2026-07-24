import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Bot, Code, CheckCircle2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { testAiPrompt } from "@/lib/assessment.functions";
import { savePromptFn } from "@/lib/admin.functions";
import { EducationLevel } from "@/lib/questions.data";

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

const DEFAULT_PROMPTS: Record<EducationLevel, { name: string; system_prompt: string; user_template: string }> = {
  TK: {
    name: "Prompt AI Jenjang TK / PAUD",
    system_prompt:
      "Anda adalah asisten psikolog anak usia dini (3-6 tahun). Evaluasi perkembangan anak, kesiapan sekolah, calistung awal, kesiapan motorik, sosial, dan emosional. Gunakan bahasa Indonesia yang hangat, positif, tidak menghakimi, dan mudah dipahami orang tua. Selalu balas dalam format JSON valid.",
    user_template:
      "Berikut data anak TK dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk analisis kemampuan akademik awal dan rekomendasi treatment di rumah.",
  },
  SD: {
    name: "Prompt AI Jenjang Sekolah Dasar (SD)",
    system_prompt:
      "Anda adalah konsultan pendidikan dan psikolog anak Sekolah Dasar (7-12 tahun). Evaluasi karakter, kebiasaan belajar, kemampuan akademik (literasi, numerasi, membaca, menulis, berhitung), disiplin, dan interaksi sosial. Gunakan bahasa profesional dan positif. Selalu balas dalam format JSON valid.",
    user_template:
      "Berikut data anak SD dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk analisis kemampuan akademik (literasi & numerasi SD) dan rekomendasi treatment.",
  },
  SMP: {
    name: "Prompt AI Jenjang Sekolah Menengah (SMP)",
    system_prompt:
      "Anda adalah psikolog remaja dan konsultan pendidikan SMP (13-15 tahun). Evaluasi prestasi akademik, pemikiran kritis, motivasi belajar, pergaulan, media sosial, disiplin, dan kesiapan masa depan. Gunakan bahasa inspiratif, konstruktif, dan membangun. Selalu balas dalam format JSON valid.",
    user_template:
      "Berikut data siswa SMP dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk pemikiran kritis, kesiapan akademik SMP, dan saran pendampingan remaja.",
  },
  SMA: {
    name: "Prompt AI Jenjang SMA / SMK",
    system_prompt:
      "Anda adalah konsultan karier dan psikolog pendidikan SMA/SMK (16-18 tahun). Evaluasi prestasi akademik, pemikiran analitis, kemampuan riset, public speaking, kesiapan masuk perguruan tinggi, kesiapan karier, dan kepemimpinan. Gunakan bahasa analitis, profesional, dan futuristik. Selalu balas dalam format JSON valid.",
    user_template:
      "Berikut data siswa SMA dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk kesiapan kuliah/karier, pemikiran analitis, dan strategi akademik mandiri.",
  },
};

function PromptAdmin() {
  const qc = useQueryClient();
  const runTest = useServerFn(testAiPrompt);
  const savePromptServer = useServerFn(savePromptFn);

  const [activeLevel, setActiveLevel] = useState<EducationLevel>("TK");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-prompt-level", activeLevel],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_prompts")
        .select("*")
        .eq("education_level", activeLevel)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) return data;
      const def = DEFAULT_PROMPTS[activeLevel];
      return {
        id: "default",
        education_level: activeLevel,
        name: def.name,
        system_prompt: def.system_prompt,
        user_template: def.user_template,
        is_active: true,
      };
    },
  });

  const [form, setForm] = useState<any>(null);
  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data, activeLevel]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await savePromptServer({ data: { ...form, education_level: activeLevel } });
      toast.success(`Prompt AI Jenjang ${activeLevel} berhasil disimpan!`);
      qc.invalidateQueries({ queryKey: ["admin-prompt-level"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal menyimpan prompt.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await runTest({ data: { sample: "test" } });
      setTestResult(res.sample ?? "Koneksi OK");
      toast.success("Tes Koneksi AI Berhasil!");
    } catch (e: any) {
      toast.error("Gagal tes AI: " + (e?.message ?? "Terjadi kesalahan"));
    } finally {
      setTesting(false);
    }
  };

  const insertTag = (tag: string) => {
    if (!form) return;
    setForm({ ...form, user_template: form.user_template + " " + tag });
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
            Sesuaikan System Prompt dan User Template secara khusus untuk jenjang TK, SD, SMP, dan SMA.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        {(["TK", "SD", "SMP", "SMA"] as EducationLevel[]).map((lvl) => (
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
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 font-medium"
          />
        </div>

        <div>
          <Label className="font-semibold">System Prompt (Peran & Karakter AI Jenjang {activeLevel})</Label>
          <Textarea
            value={form.system_prompt}
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
            value={form.user_template}
            onChange={(e) => setForm({ ...form, user_template: e.target.value })}
            rows={14}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <Switch
              id="prompt_active"
              checked={form.is_active}
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