import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Card({ title, value, icon: Icon }: { title: string; value: number | string; icon: any }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date(); today.setHours(0,0,0,0);
      const [{ count: total }, { count: todayCount }, { count: analyzed }, { count: pending }, { count: parents }] = await Promise.all([
        supabase.from("assessments").select("*", { count: "exact", head: true }),
        supabase.from("assessments").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("assessments").select("*", { count: "exact", head: true }).eq("status", "analyzed"),
        supabase.from("assessments").select("*", { count: "exact", head: true }).in("status", ["pending","analyzing","failed"]),
        supabase.from("parents").select("*", { count: "exact", head: true }),
      ]);
      return { total: total ?? 0, today: todayCount ?? 0, analyzed: analyzed ?? 0, pending: pending ?? 0, parents: parents ?? 0 };
    },
  });
  const s = stats.data;
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Ringkasan aktivitas asesmen.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card title="Total Assessment" value={s?.total ?? "—"} icon={ClipboardCheck} />
        <Card title="Hari Ini" value={s?.today ?? "—"} icon={Clock} />
        <Card title="Sudah Dianalisis" value={s?.analyzed ?? "—"} icon={CheckCircle2} />
        <Card title="Belum Diproses" value={s?.pending ?? "—"} icon={XCircle} />
        <Card title="Total Orang Tua" value={s?.parents ?? "—"} icon={Users} />
      </div>
    </div>
  );
}