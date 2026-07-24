import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardCheck, Clock, CheckCircle2, Baby, BookOpen, School, GraduationCap } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Card({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground">{title}</div>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${color ?? "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const stats = useQuery({
    queryKey: ["admin-stats-multi-level"],
    queryFn: async () => {
      const today = new Date(); today.setHours(0,0,0,0);
      const [
        { count: total },
        { count: todayCount },
        { count: analyzed },
        { count: tkCount },
        { count: sdCount },
        { count: smpCount },
        { count: smaCount },
        { count: parents }
      ] = await Promise.all([
        supabase.from("assessments").select("*", { count: "exact", head: true }),
        supabase.from("assessments").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("assessments").select("*", { count: "exact", head: true }).eq("status", "analyzed"),
        supabase.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "TK"),
        supabase.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "SD"),
        supabase.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "SMP"),
        supabase.from("assessments").select("*", { count: "exact", head: true }).eq("education_level", "SMA"),
        supabase.from("parents").select("*", { count: "exact", head: true }),
      ]);
      return {
        total: total ?? 0,
        today: todayCount ?? 0,
        analyzed: analyzed ?? 0,
        tk: tkCount ?? 0,
        sd: sdCount ?? 0,
        smp: smpCount ?? 0,
        sma: smaCount ?? 0,
        parents: parents ?? 0
      };
    },
  });

  const recentList = useQuery({
    queryKey: ["admin-recent-list", selectedLevel],
    queryFn: async () => {
      let q = supabase
        .from("assessments")
        .select("id, education_level, status, created_at, children(name), parents(name)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (selectedLevel !== "ALL") {
        q = q.eq("education_level", selectedLevel);
      }
      const { data } = await q;
      return data ?? [];
    },
  });

  const s = stats.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">Ringkasan statistik assessment per jenjang pendidikan.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total All Assessment" value={s?.total ?? 0} icon={ClipboardCheck} />
        <Card title="Assessment Hari Ini" value={s?.today ?? 0} icon={Clock} />
        <Card title="Sudah Dianalisis AI" value={s?.analyzed ?? 0} icon={CheckCircle2} />
        <Card title="Total Orang Tua" value={s?.parents ?? 0} icon={Users} />
      </div>

      {/* LEVEL STATS CARDS */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Statistik Berdasarkan Jenjang</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Total Assessment TK / PAUD" value={s?.tk ?? 0} icon={Baby} color="bg-cyan-500/10 text-cyan-600" />
          <Card title="Total Assessment SD" value={s?.sd ?? 0} icon={BookOpen} color="bg-blue-500/10 text-blue-600" />
          <Card title="Total Assessment SMP" value={s?.smp ?? 0} icon={School} color="bg-indigo-500/10 text-indigo-600" />
          <Card title="Total Assessment SMA" value={s?.sma ?? 0} icon={GraduationCap} color="bg-emerald-500/10 text-emerald-600" />
        </div>
      </div>

      {/* RECENT ASSESSMENTS TABLE WITH LEVEL FILTER */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <h3 className="font-bold text-foreground">Aktivitas Assessment Terbaru</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">Filter Jenjang:</span>
            {["ALL", "TK", "SD", "SMP", "SMA"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  selectedLevel === lvl
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {lvl === "ALL" ? "Semua" : lvl}
              </button>
            ))}
          </div>
        </div>

        {recentList.isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Memuat data terbaru…</div>
        ) : recentList.data?.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Belum ada assessment untuk jenjang ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="py-2 font-medium">Jenjang</th>
                  <th className="py-2 font-medium">Anak</th>
                  <th className="py-2 font-medium">Orang Tua</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentList.data?.map((r: any) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="py-2.5 font-bold text-primary">{r.education_level ?? "TK"}</td>
                    <td className="py-2.5 font-medium text-foreground">{r.children?.name ?? "-"}</td>
                    <td className="py-2.5 text-muted-foreground">{r.parents?.name ?? "-"}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.status === 'analyzed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}