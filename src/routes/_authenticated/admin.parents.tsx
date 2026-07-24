import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/parents")({
  component: ParentsList,
});

function ParentsList() {
  const [q, setQ] = useState("");
  const list = useQuery({
    queryKey: ["admin-parents"],
    queryFn: async () => {
      const { data } = await supabase
        .from("assessments")
        .select("id, status, created_at, parents(name, whatsapp), children(name, birth_date, school)")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  const rows = (list.data ?? []).filter((r: any) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      r.parents?.name?.toLowerCase().includes(s) ||
      r.parents?.whatsapp?.includes(s) ||
      r.children?.name?.toLowerCase().includes(s) ||
      r.children?.school?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Database Orang Tua</h1>
      <div className="mt-4 flex gap-3">
        <Input placeholder="Cari nama / WhatsApp / anak / sekolah…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Orang Tua</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Anak</th>
              <th className="p-3">Sekolah</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-border/60">
                <td className="p-3 font-medium">{r.parents?.name}</td>
                <td className="p-3">{r.parents?.whatsapp}</td>
                <td className="p-3">{r.children?.name}</td>
                <td className="p-3 text-muted-foreground">{r.children?.school ?? "-"}</td>
                <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("id-ID")}</td>
                <td className="p-3">
                  <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + (r.status === "analyzed" ? "bg-primary/10 text-primary" : r.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>{r.status}</span>
                </td>
                <td className="p-3">
                  <Link to="/assessment/result/$id" params={{ id: r.id }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Lihat</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Belum ada data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}