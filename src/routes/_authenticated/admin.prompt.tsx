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
import { Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/prompt")({ component: PromptAdmin });

function PromptAdmin() {
  const qc = useQueryClient();
  const data = useQuery({
    queryKey: ["admin-prompt"],
    queryFn: async () => (await supabase.from("ai_prompts").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle()).data,
  });
  const [f, setF] = useState<any>(null);
  useEffect(() => { if (data.data) setF(data.data); }, [data.data]);
  const save = async () => {
    if (!f) return;
    const { error } = await supabase.from("ai_prompts").update({ name: f.name, system_prompt: f.system_prompt, user_template: f.user_template, is_active: f.is_active }).eq("id", f.id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan."); qc.invalidateQueries({ queryKey: ["admin-prompt"] });
  };
  if (!f) return <div>Memuat…</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold">Prompt AI</h1>
      <p className="text-sm text-muted-foreground">Placeholder: {"{{parent_name}} {{child_name}} {{child_age}} {{answers}}"}</p>
      <div className="mt-4 grid gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <div><Label>Nama</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="mt-1.5" /></div>
        <div><Label>System Prompt</Label><Textarea value={f.system_prompt} onChange={(e) => setF({ ...f, system_prompt: e.target.value })} rows={6} className="mt-1.5 font-mono text-xs" /></div>
        <div><Label>User Template</Label><Textarea value={f.user_template} onChange={(e) => setF({ ...f, user_template: e.target.value })} rows={16} className="mt-1.5 font-mono text-xs" /></div>
        <label className="flex items-center gap-2 text-sm"><Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} /> Aktif</label>
        <div><Button onClick={save}><Save className="mr-1 h-4 w-4" /> Simpan</Button></div>
      </div>
    </div>
  );
}