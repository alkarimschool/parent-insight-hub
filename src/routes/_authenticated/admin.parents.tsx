import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ExternalLink, Edit3, Trash2, Save, X, Search, GraduationCap, MessageSquare, AlertTriangle, Loader2, RefreshCw, AlertCircle, CheckCircle2, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { updateParentChildFn, getAdminParentsFn, deleteAssessmentFn, retryAssessmentFn } from "@/lib/admin.functions";

import { getAssessmentContent } from "@/lib/assessment-content";
import { createAdminFallbackClient } from "@/lib/admin-key";

const adminFallbackSupabase = createAdminFallbackClient();

export const Route = createFileRoute("/_authenticated/admin/parents")({
  component: ParentsList,
});

function formatWaLink(phone: string, childName: string, level: string, assessmentId: string) {
  if (!phone) return "#";
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) clean = "62" + clean.slice(1);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const reportUrl = `${baseUrl}/assessment/result/${assessmentId}`;
  const content = getAssessmentContent(level);
  const text = encodeURIComponent(
    `Halo Ibu/Bapak, berikut adalah ${content.badge} Ananda ${childName || "Anak"}:\n\n${reportUrl}\n\nTerima kasih!`
  );
  return `https://wa.me/${clean}?text=${text}`;
}

function ParentsList() {
  const qc = useQueryClient();
  const getParentsList = useServerFn(getAdminParentsFn);
  const updateParentChild = useServerFn(updateParentChildFn);
  const retryAnalysis = useServerFn(retryAssessmentFn);
  const deleteAssessment = useServerFn(deleteAssessmentFn);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetryAnalysis = async (r: any) => {
    const cObj = Array.isArray(r.children) ? r.children[0] : r.children;
    const childName = cObj?.name || "Siswa";
    setRetryingId(r.id);
    try {
      await retryAnalysis({ data: { id: r.id } });
      toast.success(`✅ Proses analisis ulang untuk Ananda ${childName} telah dimulai di background.`);
      qc.invalidateQueries({ queryKey: ["admin-parents-list-rpc"] });
    } catch (err: any) {
      toast.error(err?.message || "Gagal memicu analisis ulang.");
    } finally {
      setRetryingId(null);
    }
  };

  const [q, setQ] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [deletingRow, setDeletingRow] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const list = useQuery({
    queryKey: ["admin-parents-list-rpc"],
    queryFn: async () => {
      try {
        const serverData = await getParentsList();
        if (serverData && Array.isArray(serverData) && serverData.length > 0) {
          return serverData;
        }
      } catch (err) {
        console.warn("[admin.parents] getParentsList server fn error, running client fallback:", err);
      }

      // Direct client fallback to Supabase Database (Guarantees data display on Lovable SPA)
      const [{ data: parents }, { data: children }, { data: assessments }] = await Promise.all([
        adminFallbackSupabase.from("parents").select("*").order("created_at", { ascending: false }).limit(500),
        adminFallbackSupabase.from("children").select("*").order("created_at", { ascending: false }).limit(500),
        adminFallbackSupabase.from("assessments").select("*").order("created_at", { ascending: false }).limit(500),
      ]);

      const parentMap = new Map((parents || []).map((p: any) => [p.id, p]));
      const childMap = new Map((children || []).map((c: any) => [c.id, c]));

      const resultList: any[] = [];
      const processedParentIds = new Set<string>();

      if (assessments && Array.isArray(assessments)) {
        for (const a of assessments) {
          if (a.parent_id) processedParentIds.add(a.parent_id);

          const pObj = parentMap.get(a.parent_id);
          const cObj = childMap.get(a.child_id);
          const lvl = a.education_level || cObj?.education_level || "SMA";

          resultList.push({
            id: a.id,
            status: a.status || "analyzed",
            education_level: lvl,
            created_at: a.created_at || new Date().toISOString(),
            parent_id: a.parent_id,
            child_id: a.child_id,
            parents: pObj ? { id: pObj.id, name: pObj.name, whatsapp: pObj.whatsapp } : { id: a.parent_id, name: "Orang Tua", whatsapp: "-" },
            children: cObj ? { id: cObj.id, name: cObj.name, school: cObj.school || "", birth_date: cObj.birth_date } : { id: a.child_id, name: "Anak", school: "" },
          });
        }
      }

      if (parents && Array.isArray(parents)) {
        for (const p of parents) {
          if (!processedParentIds.has(p.id)) {
            const foundC = (children || []).find((c: any) => c.parent_id === p.id);
            resultList.push({
              id: p.id,
              status: "pending",
              education_level: foundC?.education_level || "SMA",
              created_at: p.created_at || new Date().toISOString(),
              parent_id: p.id,
              child_id: foundC?.id,
              parents: { id: p.id, name: p.name, whatsapp: p.whatsapp },
              children: foundC ? { id: foundC.id, name: foundC.name, school: foundC.school || "" } : { name: "Anak", school: "" },
            });
          }
        }
      }

      resultList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return resultList;
    },
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const rows = (list.data ?? []).filter((r: any) => {
    if (!q) return true;
    const s = q.toLowerCase();
    const p = Array.isArray(r.parents) ? r.parents[0] : r.parents;
    const c = Array.isArray(r.children) ? r.children[0] : r.children;
    return (
      c?.name?.toLowerCase().includes(s) ||
      p?.whatsapp?.includes(s) ||
      p?.name?.toLowerCase().includes(s) ||
      r.education_level?.toLowerCase().includes(s) ||
      c?.school?.toLowerCase().includes(s)
    );
  });

  const handleEditClick = (r: any) => {
    const p = Array.isArray(r.parents) ? r.parents[0] : r.parents;
    const c = Array.isArray(r.children) ? r.children[0] : r.children;
    setEditingRow({
      assessment_id: r.id,
      parent_id: p?.id || r.parent_id,
      child_id: c?.id || r.child_id,
      child_name: c?.name ?? "",
      whatsapp: p?.whatsapp ?? "",
      school: c?.school ?? "",
      education_level: r.education_level || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    setSaving(true);
    try {
      await updateParentChild({
        data: {
          assessment_id: editingRow.assessment_id,
          parent_id: editingRow.parent_id,
          child_id: editingRow.child_id,
          child_name: editingRow.child_name,
          whatsapp: editingRow.whatsapp,
          school: editingRow.school,
          education_level: editingRow.education_level,
        },
      });
      toast.success("Data berhasil diperbarui.");
      setEditingRow(null);
      qc.invalidateQueries({ queryKey: ["admin-parents-list-rpc"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRow) return;
    setDeleting(true);
    try {
      const result = await deleteAssessment({ data: { id: deletingRow.id } });
      if (result && (result as any).ok) {
        toast.success("✅ Data berhasil dihapus dari Supabase.");
      } else {
        toast.success("✅ Data berhasil dihapus.");
      }
      setDeletingRow(null);
      // Force hard refetch from Supabase (not from cache)
      await qc.refetchQueries({ queryKey: ["admin-parents-list-rpc"] });
      qc.invalidateQueries({ queryKey: ["admin-stats-multi-level"] });
      qc.invalidateQueries({ queryKey: ["admin-recent-list"] });
    } catch (e: any) {
      console.error("Delete error detail:", e);
      const msg = e?.message || e?.data?.message || "Gagal menghapus data. Silakan coba lagi.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Database Asesmen & Responden</h1>
        <p className="text-sm text-muted-foreground">
          Kelola data responden, nomor WhatsApp, nama anak, dan jalankan aksi edit / hapus / kirim WA di Supabase.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari Nama Anak / WhatsApp / Sekolah…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setExportOpen(true)}
            className="rounded-xl text-xs font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
          >
            <Download className="h-4 w-4" />
            📥 Export Hasil Analisis AI
          </Button>

          <Button
            onClick={() => setExportOpen(true)}
            variant="outline"
            className="rounded-xl text-xs font-semibold gap-2 border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10"
          >
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            📊 Export QA Report
          </Button>
        </div>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />

      {/* TABLE */}
      <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card shadow-soft">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/60 bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3.5">Tanggal</th>
              <th className="p-3.5">Nama Anak</th>
              <th className="p-3.5">Jenjang</th>
              <th className="p-3.5">No WhatsApp</th>
              <th className="p-3.5">Hasil Analisis</th>
              <th className="p-3.5 text-right">Menu Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {list.isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">Memuat database Supabase…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">Belum ada data di database orang tua.</td>
              </tr>
            ) : (
              rows.map((r: any) => {
                const lvl = r.education_level || "-";
                const pObj = Array.isArray(r.parents) ? r.parents[0] : r.parents;
                const cObj = Array.isArray(r.children) ? r.children[0] : r.children;
                const waLink = formatWaLink(pObj?.whatsapp ?? "", cObj?.name ?? "", lvl, r.id);

                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      {cObj?.name ?? "-"}
                      {cObj?.school && <div className="text-[11px] font-normal text-muted-foreground">{cObj.school}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        <GraduationCap className="h-3 w-3" /> {lvl}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">{pObj?.whatsapp ?? "-"}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        {r.status === "analyzed" || r.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> 🟢 Analisis Selesai
                          </span>
                        ) : r.status === "analyzing" || r.status === "processing" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" /> 🔵 Sedang Diproses
                          </span>
                        ) : r.status === "failed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                            <AlertCircle className="h-3 w-3" /> 🔴 Gagal Diproses
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
                            <RefreshCw className="h-3 w-3 animate-spin" /> 🟡 Menunggu Analisis
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* RETRY ANALISIS BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryAnalysis(r)}
                          disabled={retryingId === r.id}
                          title="Jalankan ulang analisis AI untuk asesmen ini"
                          className="rounded-full text-[11px] h-7 px-2.5 border-purple-500/40 hover:bg-purple-500/10 text-purple-600 font-semibold"
                        >
                          {retryingId === r.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          Analisis Ulang
                        </Button>

                        {/* EDIT BUTTON */}
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(r)} className="rounded-full text-[11px] h-7 px-2.5">
                          <Edit3 className="h-3 w-3 mr-1 text-primary" /> Edit
                        </Button>

                        {/* VIEW REPORT BUTTON */}
                        <Link
                          to="/assessment/result/$id"
                          params={{ id: r.id }}
                          className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent"
                        >
                          <ExternalLink className="h-3 w-3 text-primary" /> Lihat
                        </Link>

                        {/* KIRIM WA BUTTON */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft hover:bg-emerald-700"
                        >
                          <MessageSquare className="h-3 w-3" /> WA
                        </a>

                        {/* DELETE BUTTON */}
                        <Button size="sm" variant="destructive" onClick={() => setDeletingRow(r)} className="rounded-full text-[11px] h-7 px-2">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL DIALOG */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-foreground text-base">Edit Data Responden</h3>
              <button onClick={() => setEditingRow(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <Label htmlFor="edit_child_name" className="font-semibold">Nama Anak *</Label>
                <Input
                  id="edit_child_name"
                  value={editingRow.child_name}
                  onChange={(e) => setEditingRow({ ...editingRow, child_name: e.target.value })}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_whatsapp" className="font-semibold">No WhatsApp *</Label>
                <Input
                  id="edit_whatsapp"
                  value={editingRow.whatsapp}
                  onChange={(e) => setEditingRow({ ...editingRow, whatsapp: e.target.value })}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_education_level" className="font-semibold">Jenjang Pendidikan *</Label>
                <select
                  id="edit_education_level"
                  value={editingRow.education_level}
                  onChange={(e) => setEditingRow({ ...editingRow, education_level: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-xs font-semibold"
                >
                  <option value="TK">👶 Pendidikan Anak Usia Dini (TK / PAUD)</option>
                  <option value="SD">📘 Sekolah Dasar (SD)</option>
                  <option value="SMP">📗 Sekolah Menengah Pertama (SMP)</option>
                  <option value="SMA">🎓 Sekolah Menengah Atas (SMA)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="edit_school" className="font-semibold">Nama Sekolah</Label>
                <Input
                  id="edit_school"
                  value={editingRow.school}
                  onChange={(e) => setEditingRow({ ...editingRow, school: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setEditingRow(null)} className="rounded-full text-xs">
                  Batal
                </Button>
                <Button type="submit" disabled={saving} className="rounded-full bg-gradient-hero text-xs shadow-soft">
                  <Save className="h-3.5 w-3.5 mr-1" /> {saving ? "Menyimpan…" : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {deletingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-destructive/30 bg-card p-6 shadow-elevated space-y-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-foreground text-base">Konfirmasi Hapus</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Nama Anak:</span> <span className="font-bold text-foreground">{deletingRow.children?.name || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Jenjang:</span> <span className="font-bold text-primary">{deletingRow.education_level || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp:</span> <span className="font-mono text-muted-foreground">{deletingRow.parents?.whatsapp || "-"}</span></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingRow(null)}
                disabled={deleting}
                className="rounded-full text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-full text-xs shadow-soft"
              >
                {deleting ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Menghapus…</>
                ) : (
                  <><Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}