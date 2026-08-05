import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, ClipboardCheck, Clock, CheckCircle2, Baby, BookOpen, School, GraduationCap, Wrench, ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStatsFn, getAdminRecentFn } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Card({ title, value, icon: Icon, color, to }: { title: string; value: number | string; icon: any; color?: string; to?: string }) {
  const content = (
    <div className="group rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-muted-foreground">{title}</div>
        <span className={`grid h-9 w-9 place-items-center rounded-xl transition-transform group-hover:scale-110 ${color ?? "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <span className="text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100 flex items-center gap-0.5">
          Lihat <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to as any}>{content}</Link>;
  }
  return content;
}

function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const getStats = useServerFn(getAdminStatsFn);
  const getRecent = useServerFn(getAdminRecentFn);

  const stats = useQuery({
    queryKey: ["admin-stats-multi-level"],
    queryFn: async () => {
      try {
        const sRes = await getStats();
        if (sRes && typeof sRes === "object" && sRes.total !== undefined) {
          return sRes;
        }
      } catch (err) {
        console.warn("[admin.index] getStats server fn error, running client fallback:", err);
      }

      // Direct client fallback for stats
      const [{ count: totalAss }, { count: parentCount }, { data: assRows }] = await Promise.all([
        supabase.from("assessments").select("*", { count: "exact", head: true }),
        supabase.from("parents").select("*", { count: "exact", head: true }),
        supabase.from("assessments").select("education_level, status"),
      ]);

      const rows = assRows || [];
      const analyzed = rows.filter((r: any) => r.status === "analyzed" || r.status === "completed").length;
      const tk = rows.filter((r: any) => (r.education_level || "").toUpperCase() === "TK").length;
      const sd = rows.filter((r: any) => (r.education_level || "").toUpperCase() === "SD").length;
      const smp = rows.filter((r: any) => (r.education_level || "").toUpperCase() === "SMP").length;
      const sma = rows.filter((r: any) => ["SMA", "SMK"].includes((r.education_level || "").toUpperCase())).length;

      return {
        total: totalAss || 0,
        today: totalAss || 0,
        analyzed: analyzed,
        parents: parentCount || 0,
        tk,
        sd,
        smp,
        sma,
      };
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const recentList = useQuery({
    queryKey: ["admin-recent-list", selectedLevel],
    queryFn: async () => {
      try {
        const rRes = await getRecent({ data: { level: selectedLevel } });
        if (rRes && Array.isArray(rRes)) {
          return rRes;
        }
      } catch (err) {
        console.warn("[admin.index] getRecent server fn error, running client fallback:", err);
      }

      // Direct client fallback for recent list
      const [{ data: parents }, { data: children }, { data: assessments }] = await Promise.all([
        supabase.from("parents").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("children").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("assessments").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      const parentMap = new Map((parents || []).map((p: any) => [p.id, p]));
      const childMap = new Map((children || []).map((c: any) => [c.id, c]));

      let resultList = (assessments || []).map((a: any) => {
        const pObj = parentMap.get(a.parent_id);
        const cObj = childMap.get(a.child_id);
        const lvl = a.education_level || cObj?.education_level || "SMA";
        return {
          id: a.id,
          status: a.status || "analyzed",
          education_level: lvl,
          created_at: a.created_at || new Date().toISOString(),
          parent_id: a.parent_id,
          child_id: a.child_id,
          parents: pObj ? { id: pObj.id, name: pObj.name, whatsapp: pObj.whatsapp } : { id: a.parent_id, name: "Orang Tua", whatsapp: "-" },
          children: cObj ? { id: cObj.id, name: cObj.name, school: cObj.school || "", birth_date: cObj.birth_date } : { id: a.child_id, name: "Anak", school: "" },
        };
      });

      if (selectedLevel && selectedLevel !== "ALL") {
        resultList = resultList.filter((r: any) => (r.education_level || "").toUpperCase() === selectedLevel.toUpperCase());
      }

      return resultList;
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const s = stats.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground">Ringkasan statistik assessment & koneksi ke Database Orang Tua.</p>
        </div>
        <Link
          to="/admin/parents"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-soft transition hover:opacity-95"
        >
          <Users className="h-4 w-4" /> Kelola Database Orang Tua <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total All Assessment" value={s?.total ?? 0} icon={ClipboardCheck} to="/admin/parents" />
        <Card title="Assessment Hari Ini" value={s?.today ?? 0} icon={Clock} to="/admin/parents" />
        <Card title="Sudah Dianalisis AI" value={s?.analyzed ?? 0} icon={CheckCircle2} to="/admin/parents" />
        <Card title="Total Responden Orang Tua" value={s?.parents ?? 0} icon={Users} to="/admin/parents" />
      </div>

      {/* LEVEL STATS CARDS */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Statistik Responden Per Jenjang</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Total Assessment TK / PAUD" value={s?.tk ?? 0} icon={Baby} color="bg-cyan-500/10 text-cyan-600" to="/admin/parents" />
          <Card title="Total Assessment SD" value={s?.sd ?? 0} icon={BookOpen} color="bg-blue-500/10 text-blue-600" to="/admin/parents" />
          <Card title="Total Assessment SMP" value={s?.smp ?? 0} icon={School} color="bg-indigo-500/10 text-indigo-600" to="/admin/parents" />
          <Card title="Total Assessment SMA" value={s?.sma ?? 0} icon={GraduationCap} color="bg-emerald-500/10 text-emerald-600" to="/admin/parents" />
        </div>
      </div>

      {/* RECENT ASSESSMENTS TABLE — SAME DATA SOURCE & COLUMNS AS DATABASE ORANG TUA */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">Aktivitas Asesmen Terbaru</h3>
            <Link to="/admin/parents" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              (Buka Database Orang Tua <ArrowRight className="h-3 w-3 inline" />)
            </Link>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">Filter Jenjang:</span>
            {["ALL", "TK", "SD", "SMP", "SMA"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
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
          <div className="py-8 text-center text-xs text-muted-foreground">Memuat data terbaru dari Supabase…</div>
        ) : recentList.data?.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Belum ada assessment untuk jenjang ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/50 uppercase text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Nama Anak</th>
                  <th className="py-2.5 px-3">Jenjang</th>
                  <th className="py-2.5 px-3">No WhatsApp</th>
                  <th className="py-2.5 px-3">Hasil Analisis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {(recentList.data as any[])?.map((r: any) => {
                  const lvl = r.education_level || "-";
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {r.children?.name ?? "-"}
                        {r.children?.school && <div className="text-[11px] font-normal text-muted-foreground">{r.children.school}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                          <GraduationCap className="h-3 w-3" /> {lvl}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">{r.parents?.whatsapp ?? "-"}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'analyzed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            {r.status === 'analyzed' ? 'Selesai Analisis' : 'Diproses'}
                          </span>
                          <Link
                            to="/assessment/result/$id"
                            params={{ id: r.id }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Laporan {lvl}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}