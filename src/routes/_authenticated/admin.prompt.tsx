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

export const Route = createFileRoute("/_authenticated/admin/prompt")({
  component: PromptAdmin,
});

const PLACEHOLDERS = [
  { tag: "{{parent_name}}", label: "Nama Orang Tua" },
  { tag: "{{parent_whatsapp}}", label: "WhatsApp" },
  { tag: "{{child_name}}", label: "Nama Anak" },
  { tag: "{{child_school}}", label: "Sekolah" },
  { tag: "{{answers}}", label: "Daftar Jawaban" },
];

function PromptAdmin() {
  const qc = useQueryClient();
  const runTest = useServerFn(testAiPrompt);
  const savePromptServer = useServerFn(savePromptFn);

  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-prompt"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_prompts")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) return data;
      return {
        id: "default",
        name: "Default Assessment Prompt",
        system_prompt:
          "Anda adalah asisten psikolog anak yang membantu orang tua memahami perkembangan anak usia TK (3-6 tahun). Gunakan bahasa Indonesia yang hangat, positif, membangun, mudah dipahami orang tua, dan tidak menghakimi. Selalu balas dalam format JSON valid.",
        user_template:
          "Berikut data anak dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian.",
        is_active: true,
      };
    },
  });

  const [form, setForm] = useState<any>(null);
  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await savePromptServer({ data: form });
      toast.success("Prompt AI berhasil disimpan!");
      qc.invalidateQueries({ queryKey: ["admin-prompt"] });
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
    return <div className="py-12 text-center text-muted-foreground">Memuat konfigurasi Prompt AI…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Prompt AI</h1>
          <p className="text-sm text-muted-foreground">
            Sesuaikan System Prompt dan User Template untuk analisis perkembangan anak.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTest} disabled={testing} className="rounded-full">
            <Bot className="mr-1.5 h-4 w-4 text-primary" /> {testing ? "Pengujian…" : "Test AI"}
          </Button>
          <Button onClick={save} disabled={saving} className="rounded-full bg-gradient-hero shadow-soft">
            <Save className="mr-1.5 h-4 w-4" /> {saving ? "Menyimpan…" : "Simpan Prompt"}
          </Button>
        </div>
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
          <Label className="font-semibold">Nama Prompt</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5"
            placeholder="Default Assessment Prompt"
          />
        </div>

        <div>
          <Label className="font-semibold">System Prompt (Peran & Aturan AI)</Label>
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
            <Label htmlFor="prompt_active" className="cursor-pointer text-sm">
              Aktifkan Prompt Ini Sebagai Default
            </Label>
          </div>
          <Button onClick={save} disabled={saving} className="rounded-full bg-gradient-hero shadow-soft">
            <Save className="mr-1.5 h-4 w-4" /> {saving ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </div>
  );
}