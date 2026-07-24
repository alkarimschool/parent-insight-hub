import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Plus, Trash2, Save, Filter, GraduationCap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { LEVEL_QUESTIONS, EducationLevel } from "@/lib/questions.data";

export const Route = createFileRoute("/_authenticated/admin/questions")({ component: QuestionsAdmin });

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function QuestionsAdmin() {
  const qc = useQueryClient();
  const [levelFilter, setLevelFilter] = useState<string>("TK");

  const data = useQuery({
    queryKey: ["admin-questions-list", levelFilter],
    queryFn: async () => {
      try {
        let q = supabase.from("questions").select("*").order("order_index");
        if (levelFilter !== "ALL") {
          q = q.eq("education_level", levelFilter);
        }
        const [{ data: qs }, { data: cats }] = await Promise.all([
          q,
          supabase.from("question_categories").select("*").order("order_index"),
        ]);
        if (qs && qs.length > 0) {
          return { qs: qs ?? [], cats: cats ?? [] };
        }
      } catch (e) {
        console.warn("Could not fetch DB questions", e);
      }

      // Fallback: If DB table has no questions yet, show default level questions!
      const level = (levelFilter === "ALL" ? "TK" : levelFilter) as EducationLevel;
      let defaults: any[] = [];
      if (levelFilter === "ALL") {
        defaults = [
          ...LEVEL_QUESTIONS.TK,
          ...LEVEL_QUESTIONS.SD,
          ...LEVEL_QUESTIONS.SMP,
          ...LEVEL_QUESTIONS.SMA,
        ];
      } else {
        defaults = LEVEL_QUESTIONS[level] || LEVEL_QUESTIONS.TK;
      }

      return {
        qs: defaults.map((q) => ({
          id: q.id,
          text: q.text,
          order_index: q.order_index,
          category_name: q.category_name,
          education_level: q.education_level,
          is_active: true,
        })),
        cats: [],
      };
    },
  });

  const [text, setText] = useState("");
  const [catId, setCatId] = useState("");
  const [addLevel, setAddLevel] = useState<EducationLevel>("TK");

  const add = async () => {
    if (!text) return toast.error("Isi pertanyaan.");
    const max = Math.max(0, ...(data.data?.qs ?? []).map((q: any) => q.order_index ?? 0));
    const targetLevel = levelFilter !== "ALL" ? levelFilter : addLevel;

    const { error } = await supabase.from("questions").insert({
      text,
      category_id: catId || null,
      order_index: max + 1,
      education_level: targetLevel,
      is_active: true,
    });
    if (error) return toast.error(error.message);
    setText("");
    toast.success(`Pertanyaan jenjang ${targetLevel} ditambahkan ke database.`);
    qc.invalidateQueries({ queryKey: ["admin-questions-list"] });
  };

  const update = async (id: string, patch: any) => {
    let error: any = null;

    if (isUUID(id)) {
      const res = await supabase.from("questions").update(patch).eq("id", id);
      error = res.error;
    } else {
      // Save default fallback question directly into DB as a new persistent row
      const res = await supabase.from("questions").insert({
        text: patch.text || "",
        order_index: patch.order_index ?? 1,
        education_level: patch.education_level || "TK",
        is_active: patch.is_active ?? true,
      });
      error = res.error;
    }

    if (error) return toast.error("Gagal menyimpan: " + error.message);
    toast.success("Pertanyaan berhasil disimpan ke database.");
    qc.invalidateQueries({ queryKey: ["admin-questions-list"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus pertanyaan ini?")) return;
    if (isUUID(id)) {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) return toast.error(error.message);
    }
    toast.success("Pertanyaan dihapus.");
    qc.invalidateQueries({ queryKey: ["admin-questions-list"] });
  };

  const cats = data.data?.cats ?? [];
  const list = data.data?.qs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Pertanyaan Assessment</h1>
          <p className="text-sm text-muted-foreground">Filter dan kelola pertanyaan berdasarkan jenjang pendidikan (TK, SD, SMP, SMA).</p>
        </div>
        {/* LEVEL FILTER TABS */}
        <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card p-1 shadow-soft">
          {["TK", "SD", "SMP", "SMA", "ALL"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                levelFilter === lvl
                  ? "bg-gradient-hero text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {lvl === "ALL" ? "Semua Jenjang" : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* ADD QUESTION BOX */}
      <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Tambah Pertanyaan Baru ({levelFilter === "ALL" ? addLevel : levelFilter})
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_160px_140px_auto]">
          <Input placeholder="Teks pertanyaan baru…" value={text} onChange={(e) => setText(e.target.value)} />
          <select className="rounded-xl border border-input bg-background px-3 text-xs font-medium" value={catId} onChange={(e) => setCatId(e.target.value)}>
            <option value="">-- Kategori --</option>
            {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {levelFilter === "ALL" && (
            <select className="rounded-xl border border-input bg-background px-3 text-xs font-medium" value={addLevel} onChange={(e) => setAddLevel(e.target.value as EducationLevel)}>
              <option value="TK">Jenjang TK</option>
              <option value="SD">Jenjang SD</option>
              <option value="SMP">Jenjang SMP</option>
              <option value="SMA">Jenjang SMA</option>
            </select>
          )}
          <Button onClick={add} className="rounded-full bg-gradient-hero shadow-soft">
            <Plus className="mr-1 h-4 w-4" /> Simpan
          </Button>
        </div>
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
          <span>Menampilkan {list.length} Pertanyaan ({levelFilter})</span>
          <span>Status</span>
        </div>
        {data.isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Memuat pertanyaan…</div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
            Belum ada pertanyaan terdaftar.
          </div>
        ) : (
          list.map((q: any) => (
            <Row key={q.id} q={q} cats={cats} onUpdate={(p: any) => update(q.id, p)} onDelete={() => remove(q.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function Row({ q, cats, onUpdate, onDelete }: any) {
  const [t, setT] = useState(q.text);
  const [c, setC] = useState(q.category_id ?? "");
  const [lvl, setLvl] = useState(q.education_level ?? "TK");
  const [o, setO] = useState(q.order_index);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px_100px_80px_auto]">
        <Textarea value={t} onChange={(e) => setT(e.target.value)} rows={2} className="text-xs" />
        <select className="rounded-xl border border-input bg-background px-3 text-xs" value={c} onChange={(e) => setC(e.target.value)}>
          <option value="">-- Kategori --</option>
          {cats.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <select className="rounded-xl border border-input bg-background px-3 text-xs font-semibold text-primary" value={lvl} onChange={(e) => setLvl(e.target.value)}>
          <option value="TK">TK</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA">SMA</option>
        </select>
        <Input type="number" value={o} onChange={(e) => setO(Number(e.target.value))} className="text-xs" />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
            <Switch checked={q.is_active} onCheckedChange={(v) => onUpdate({ is_active: v, text: t, category_id: c || null, education_level: lvl, order_index: o })} />
            Aktif
          </label>
          <Button size="sm" variant="outline" onClick={() => onUpdate({ text: t, category_id: c || null, education_level: lvl, order_index: o })} className="rounded-full">
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete} className="rounded-full">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}