import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/questions")({ component: QuestionsAdmin });

function QuestionsAdmin() {
  const qc = useQueryClient();
  const data = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const [{ data: qs }, { data: cats }] = await Promise.all([
        supabase.from("questions").select("*").order("order_index"),
        supabase.from("question_categories").select("*").order("order_index"),
      ]);
      return { qs: qs ?? [], cats: cats ?? [] };
    },
  });
  const [text, setText] = useState("");
  const [catId, setCatId] = useState("");

  const add = async () => {
    if (!text) return toast.error("Isi pertanyaan.");
    const max = Math.max(0, ...(data.data?.qs ?? []).map((q: any) => q.order_index ?? 0));
    const { error } = await supabase.from("questions").insert({ text, category_id: catId || null, order_index: max + 1 });
    if (error) return toast.error(error.message);
    setText("");
    toast.success("Ditambahkan.");
    qc.invalidateQueries({ queryKey: ["admin-questions"] });
  };
  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("questions").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Disimpan.");
    qc.invalidateQueries({ queryKey: ["admin-questions"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Hapus pertanyaan ini?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-questions"] });
  };

  const cats = data.data?.cats ?? [];
  return (
    <div>
      <h1 className="text-2xl font-bold">Kelola Pertanyaan</h1>
      <div className="mt-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
          <Input placeholder="Pertanyaan baru…" value={text} onChange={(e) => setText(e.target.value)} />
          <select className="rounded-md border border-input bg-background px-3 text-sm" value={catId} onChange={(e) => setCatId(e.target.value)}>
            <option value="">-- Kategori --</option>
            {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button onClick={add}><Plus className="mr-1 h-4 w-4" /> Tambah</Button>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {data.data?.qs?.map((q: any) => (
          <Row key={q.id} q={q} cats={cats} onUpdate={(p: any) => update(q.id, p)} onDelete={() => remove(q.id)} />
        ))}
      </div>
    </div>
  );
}

function Row({ q, cats, onUpdate, onDelete }: any) {
  const [t, setT] = useState(q.text);
  const [c, setC] = useState(q.category_id ?? "");
  const [o, setO] = useState(q.order_index);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_100px_auto]">
        <Textarea value={t} onChange={(e) => setT(e.target.value)} rows={2} />
        <select className="rounded-md border border-input bg-background px-3 text-sm" value={c} onChange={(e) => setC(e.target.value)}>
          <option value="">-- Kategori --</option>
          {cats.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <Input type="number" value={o} onChange={(e) => setO(Number(e.target.value))} />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs"><Switch checked={q.is_active} onCheckedChange={(v) => onUpdate({ is_active: v })} /> Aktif</label>
          <Button size="sm" variant="outline" onClick={() => onUpdate({ text: t, category_id: c || null, order_index: o })}><Save className="h-4 w-4" /></Button>
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}