import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bot, MessageSquare, Save, Zap, Lock, LockOpen } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { testAiPrompt } from "@/lib/assessment.functions";
import { saveAiSettingsFn, saveWaSettingsFn } from "@/lib/admin.functions";
import { setAssessmentLockFn } from "@/lib/locks.functions";
import { fetchAssessmentLocks, LOCK_LEVELS } from "@/lib/locks";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

function AssessmentLockPanel() {
  const qc = useQueryClient();
  const setLock = useServerFn(setAssessmentLockFn);
  const [pending, setPending] = useState<string | null>(null);
  const locksQuery = useQuery({
    queryKey: ["assessment-locks"],
    queryFn: fetchAssessmentLocks,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const save = async (level: string, nextLocked: boolean) => {
    setPending(level);
    try {
      await setLock({ data: { level, is_locked: nextLocked } });
      await qc.invalidateQueries({ queryKey: ["assessment-locks"] });
      await qc.invalidateQueries({ queryKey: ["assessment-card-settings"] });
      await qc.invalidateQueries({ queryKey: ["admin-locks-edit"] });
      await qc.invalidateQueries({ queryKey: ["admin-cards-edit"] });
      toast.success(nextLocked ? `Assessment ${level} dikunci.` : `Assessment ${level} diaktifkan.`);
    } catch (e: any) {
      toast.error("Gagal menyimpan status: " + (e?.message ?? "Error"));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-6">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-foreground">Kunci / Buka Assessment per Jenjang</h2>
          <p className="text-xs text-muted-foreground">
            Jenjang yang terkunci tidak dapat dibuka atau dikerjakan pengguna, termasuk melalui URL langsung.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LOCK_LEVELS.map((lvl) => {
          const locked = !!locksQuery.data?.[lvl];
          return (
            <div key={lvl} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background p-4">
              <div>
                <div className="font-bold text-foreground">Jenjang {lvl}</div>
                <div className={"text-xs font-semibold " + (locked ? "text-amber-600" : "text-emerald-600")}>
                  {locked ? "🔒 Terkunci" : "🔓 Terbuka"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id={`lock_${lvl}`}
                  checked={!locked}
                  disabled={locksQuery.isLoading || pending === lvl}
                  onCheckedChange={(v) => save(lvl, !v)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant={locked ? "default" : "outline"}
                  disabled={pending === lvl || locksQuery.isLoading}
                  onClick={() => save(lvl, !locked)}
                  className="rounded-full"
                >
                  {locked ? <Lock className="mr-1.5 h-4 w-4" /> : <LockOpen className="mr-1.5 h-4 w-4" />}
                  {pending === lvl ? "Menyimpan…" : locked ? "Buka Kunci" : "Kunci"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsAdmin() {
  const qc = useQueryClient();
  const runTestAi = useServerFn(testAiPrompt);
  const saveAiServer = useServerFn(saveAiSettingsFn);
  const saveWaServer = useServerFn(saveWaSettingsFn);

  const [testingAi, setTestingAi] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [savingWa, setSavingWa] = useState(false);

  // AI settings query
  const aiQuery = useQuery({
    queryKey: ["admin-ai-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (
        data ?? {
          id: "default",
          model: "google/gemini-3.6-flash",
          temperature: 0.7,
          max_tokens: 4096,
          is_active: true,
        }
      );
    },
  });

  // WA settings query
  const waQuery = useQuery({
    queryKey: ["admin-wa-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (
        data ?? {
          id: "default",
          api_url: "https://api.fonnte.com/send",
          api_token: "",
          sender: "",
          template: "Halo {{parent_name}}, hasil asesmen perkembangan {{child_name}} telah selesai dianalisis oleh AI. Silakan cek laporan lengkapnya.",
          is_active: false,
        }
      );
    },
  });

  const [aiForm, setAiForm] = useState<any>(null);
  const [waForm, setWaForm] = useState<any>(null);

  useEffect(() => {
    if (aiQuery.data) setAiForm(aiQuery.data);
  }, [aiQuery.data]);

  useEffect(() => {
    if (waQuery.data) setWaForm(waQuery.data);
  }, [waQuery.data]);

  const saveAi = async () => {
    if (!aiForm) return;
    setSavingAi(true);
    try {
      await saveAiServer({ data: aiForm });
      toast.success("Pengaturan AI berhasil disimpan!");
      qc.invalidateQueries({ queryKey: ["admin-ai-settings"] });
    } catch (e: any) {
      toast.error("Gagal menyimpan AI settings: " + (e?.message ?? "Error"));
    } finally {
      setSavingAi(false);
    }
  };

  const saveWa = async () => {
    if (!waForm) return;
    setSavingWa(true);
    try {
      await saveWaServer({ data: waForm });
      toast.success("Pengaturan WhatsApp berhasil disimpan!");
      qc.invalidateQueries({ queryKey: ["admin-wa-settings"] });
    } catch (e: any) {
      toast.error("Gagal menyimpan WA settings: " + (e?.message ?? "Error"));
    } finally {
      setSavingWa(false);
    }
  };

  const handleTestAi = async () => {
    setTestingAi(true);
    try {
      const res = await runTestAi({ data: {} });
      toast.success("Koneksi AI Berhasil! Respon: " + (res.sample ?? "OK"));
    } catch (e: any) {
      toast.error("Koneksi AI Gagal: " + (e?.message ?? "Terjadi kesalahan"));
    } finally {
      setTestingAi(false);
    }
  };

  const handleTestWa = async () => {
    if (!waForm?.api_url || !waForm?.api_token) {
      toast.error("Isi API URL dan API Token WhatsApp terlebih dahulu.");
      return;
    }
    setTestingWa(true);
    try {
      await fetch(waForm.api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${waForm.api_token}`,
        },
        body: JSON.stringify({
          target: "08000000000",
          message: "Test message from PAA Admin",
        }),
      });
      toast.success("Permintaan tes WhatsApp terkirim!");
    } catch (e: any) {
      toast.error("Tes WA Gagal: " + (e?.message ?? "Gagal terhubung"));
    } finally {
      setTestingWa(false);
    }
  };

  if (aiQuery.isLoading || waQuery.isLoading || !aiForm || !waForm) {
    return <div className="py-12 text-center text-muted-foreground">Memuat integrasi…</div>;
  }

  return (
    <div className="space-y-8">
      <AssessmentLockPanel />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrasi AI & WhatsApp</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurasi penyedia layanan AI Engine dan Gateway Notifikasi WhatsApp.
        </p>
      </div>

      {/* AI ENGINE SETTINGS */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-6">
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">Integrasi AI Engine</h2>
            <p className="text-xs text-muted-foreground">Pilih model AI dan atur parameter analisis kecerdasan.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="font-semibold">Model AI</Label>
            <select
              value={aiForm.model}
              onChange={(e) => setAiForm({ ...aiForm, model: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="google/gemini-3.6-flash">Google Gemini 3.6 Flash (Default & Cepat)</option>
              <option value="google/gemini-1.5-pro">Google Gemini 1.5 Pro</option>
              <option value="openai/gpt-4o">OpenAI GPT-4o</option>
              <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini</option>
            </select>
          </div>

          <div>
            <Label className="font-semibold">Temperature ({aiForm.temperature})</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={aiForm.temperature}
              onChange={(e) => setAiForm({ ...aiForm, temperature: parseFloat(e.target.value) })}
              className="mt-1.5"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              0.0 = Hasil konsisten & presisi, 1.0 = Hasil lebih kreatif.
            </p>
          </div>

          <div>
            <Label className="font-semibold">Max Tokens Output</Label>
            <Input
              type="number"
              step="256"
              value={aiForm.max_tokens}
              onChange={(e) => setAiForm({ ...aiForm, max_tokens: parseInt(e.target.value) })}
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="ai_active"
              checked={aiForm.is_active}
              onCheckedChange={(v) => setAiForm({ ...aiForm, is_active: v })}
            />
            <Label htmlFor="ai_active" className="cursor-pointer text-sm font-semibold">
              Aktifkan Analisis AI
            </Label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Button variant="outline" type="button" onClick={handleTestAi} disabled={testingAi} className="rounded-full">
            <Zap className="mr-1.5 h-4 w-4 text-amber-500" /> {testingAi ? "Menguji…" : "Test AI Connection"}
          </Button>
          <Button type="button" onClick={saveAi} disabled={savingAi} className="rounded-full bg-gradient-hero shadow-soft">
            <Save className="mr-1.5 h-4 w-4" /> {savingAi ? "Menyimpan…" : "Simpan Pengaturan AI"}
          </Button>
        </div>
      </div>

      {/* WHATSAPP SETTINGS */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-6">
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <MessageSquare className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">Integrasi Gateway WhatsApp</h2>
            <p className="text-xs text-muted-foreground">Kirim notifikasi otomatis laporan hasil asesmen ke orang tua.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="font-semibold">API Gateway URL</Label>
            <Input
              value={waForm.api_url ?? ""}
              onChange={(e) => setWaForm({ ...waForm, api_url: e.target.value })}
              placeholder="https://api.fonnte.com/send"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="font-semibold">API Token / Secret Key</Label>
            <Input
              type="password"
              value={waForm.api_token ?? ""}
              onChange={(e) => setWaForm({ ...waForm, api_token: e.target.value })}
              placeholder="API Key Provider WA Anda"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="font-semibold">Nomor Pengirim (Sender Number)</Label>
            <Input
              value={waForm.sender ?? ""}
              onChange={(e) => setWaForm({ ...waForm, sender: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="wa_active"
              checked={waForm.is_active}
              onCheckedChange={(v) => setWaForm({ ...waForm, is_active: v })}
            />
            <Label htmlFor="wa_active" className="cursor-pointer text-sm font-semibold">
              Aktifkan Pengiriman WhatsApp Otomatis
            </Label>
          </div>
        </div>

        <div>
          <Label className="font-semibold">Template Pesan WhatsApp</Label>
          <Textarea
            value={waForm.template ?? ""}
            onChange={(e) => setWaForm({ ...waForm, template: e.target.value })}
            rows={4}
            className="mt-1.5 font-mono text-xs leading-relaxed"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Variabel otomatis: <code className="bg-muted px-1 rounded">{"{{parent_name}}"}</code>, <code className="bg-muted px-1 rounded">{"{{child_name}}"}</code>
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Button variant="outline" type="button" onClick={handleTestWa} disabled={testingWa} className="rounded-full">
            <MessageSquare className="mr-1.5 h-4 w-4 text-emerald-600" /> {testingWa ? "Menguji…" : "Test WhatsApp"}
          </Button>
          <Button type="button" onClick={saveWa} disabled={savingWa} className="rounded-full bg-gradient-hero shadow-soft">
            <Save className="mr-1.5 h-4 w-4" /> {savingWa ? "Menyimpan…" : "Simpan Pengaturan WA"}
          </Button>
        </div>
      </div>
    </div>
  );
}