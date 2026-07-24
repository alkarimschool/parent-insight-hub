import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/logs")({ component: Logs });

function Logs() {
  const list = useQuery({
    queryKey: ["logs"],
    queryFn: async () => (await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100)).data ?? [],
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">Activity Logs</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Waktu</th><th className="p-3">Aksi</th><th className="p-3">Entitas</th><th className="p-3">ID</th></tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((r: any) => (
              <tr key={r.id} className="border-t border-border/60">
                <td className="p-3">{new Date(r.created_at).toLocaleString("id-ID")}</td>
                <td className="p-3">{r.action}</td>
                <td className="p-3">{r.entity}</td>
                <td className="p-3 font-mono text-xs">{r.entity_id}</td>
              </tr>
            ))}
            {(list.data ?? []).length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada log.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}