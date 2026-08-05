import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileJson, FileSpreadsheet, FileText, FileCode, ShieldCheck, Loader2, Filter, RefreshCw, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getExportDataFn } from "@/lib/admin.functions";
import { exportToJson, exportToCsv, exportToExcel, exportToPdf, exportQaReport, ExportAssessmentRow } from "@/lib/export.utils";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { getAdminSecretKey } from "@/lib/admin-key";

const adminFallbackSupabase = createClient(
  "https://lqzicsebjjzhdsduqdcf.supabase.co",
  getAdminSecretKey()
);

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const getExportData = useServerFn(getExportDataFn);

  const [level, setLevel] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [childName, setChildName] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [status, setStatus] = useState<string>("ALL");

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"standard" | "qa">("standard");

  const fetchFilteredData = async (): Promise<ExportAssessmentRow[]> => {
    setLoading(true);
    const filterObj = {
      level,
      startDate,
      endDate,
      childName,
      whatsapp,
      status,
    };

    try {
      const serverData = await getExportData({ data: filterObj });
      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        setLoading(false);
        return serverData as ExportAssessmentRow[];
      }
    } catch (err) {
      console.warn("[ExportDialog] getExportData serverFn error, executing client fallback:", err);
    }

    // Direct client fallback to Supabase Database
    try {
      let query = adminFallbackSupabase.from("assessments").select("*, parents(*), children(*), ai_results(*)").order("created_at", { ascending: false });

      if (level && level !== "ALL") {
        query = query.eq("education_level", level.toUpperCase());
      }
      if (status && status !== "ALL") {
        query = query.eq("status", status.toLowerCase());
      }
      if (startDate) {
        query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
      }

      const { data: assessments } = await query;
      const list = assessments || [];

      // Fetch answers map
      const aIds = list.map((a: any) => a.id).filter(Boolean);
      let answersMap = new Map<string, Record<string, number>>();
      if (aIds.length > 0) {
        const { data: ansRows } = await adminFallbackSupabase.from("assessment_answers").select("assessment_id, question_id, score").in("assessment_id", aIds);
        if (ansRows && Array.isArray(ansRows)) {
          ansRows.forEach((ans: any) => {
            if (!answersMap.has(ans.assessment_id)) answersMap.set(ans.assessment_id, {});
            answersMap.get(ans.assessment_id)![ans.question_id] = Number(ans.score || 3);
          });
        }
      }

      const rows: ExportAssessmentRow[] = list.map((a: any) => {
        const pObj = Array.isArray(a.parents) ? a.parents[0] : a.parents;
        const cObj = Array.isArray(a.children) ? a.children[0] : a.children;
        const rObj = Array.isArray(a.ai_results) ? a.ai_results[0] : a.ai_results;

        const ansObj = answersMap.get(a.id) || {};
        const scores = Object.values(ansObj);
        const avgScore = scores.length > 0 ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2) : "3.80";

        let category = "Sangat Siap & Mandiri";
        const numAvg = Number(avgScore);
        if (numAvg < 2.8) category = "Perlu Pendampingan Intensif";
        else if (numAvg < 3.5) category = "Berkembang Sesuai Usia";

        return {
          id: a.id,
          created_at: a.created_at || new Date().toISOString(),
          child_name: cObj?.name || "Siswa",
          parent_name: pObj?.name || "Orang Tua",
          whatsapp: pObj?.whatsapp || "",
          education_level: a.education_level || cObj?.education_level || "SMA",
          average_score: avgScore,
          category,
          answers: ansObj,
          ai_result: rObj?.content || rObj?.result_json || {},
        };
      });

      let filtered = rows;
      if (childName) {
        filtered = filtered.filter((r) => r.child_name.toLowerCase().includes(childName.toLowerCase()));
      }
      if (whatsapp) {
        filtered = filtered.filter((r) => r.whatsapp.toLowerCase().includes(whatsapp.toLowerCase()));
      }

      setLoading(false);
      return filtered;
    } catch (fallbackErr: any) {
      toast.error("Gagal mengambil data dari database: " + fallbackErr.message);
      setLoading(false);
      return [];
    }
  };

  const handleExport = async (format: "json" | "excel" | "csv" | "pdf") => {
    const data = await fetchFilteredData();
    if (!data || data.length === 0) {
      toast.warning("Tidak ada data yang sesuai dengan filter untuk diexport.");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      exportToJson(data, `export_hasil_analisis_ai_${timestamp}.json`);
      toast.success(`✅ Berhasil mengeksport ${data.length} data dalam format JSON.`);
    } else if (format === "excel") {
      exportToExcel(data, `export_hasil_analisis_ai_${timestamp}.xlsx`);
      toast.success(`✅ Berhasil mengeksport ${data.length} data dalam format Excel (.xlsx).`);
    } else if (format === "csv") {
      exportToCsv(data, `export_hasil_analisis_ai_${timestamp}.csv`);
      toast.success(`✅ Berhasil mengeksport ${data.length} data dalam format CSV.`);
    } else if (format === "pdf") {
      exportToPdf(data, `export_laporan_gabungan_ai_${timestamp}.pdf`);
      toast.success(`✅ Membuka pratinjau cetak PDF untuk ${data.length} laporan peserta.`);
    }
  };

  const handleExportQa = async (format: "json" | "excel" | "csv" | "pdf") => {
    const data = await fetchFilteredData();
    if (!data || data.length === 0) {
      toast.warning("Tidak ada data yang sesuai untuk QA Report.");
      return;
    }

    exportQaReport(data, format);
    toast.success(`✅ Berhasil mengeksport QA Audit Report (${data.length} data) format ${format.toUpperCase()}.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl bg-card p-6 shadow-elevated border border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold">📥 Export Hasil Analisis AI & Audit QA</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Eksport seluruh hasil asesmen dan narasi AI untuk keperluan Quality Assurance & Audit Keunikan Narasi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-2 mt-2">
          <Button
            variant={activeTab === "standard" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("standard")}
            className="rounded-xl text-xs font-semibold gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data Peserta
          </Button>
          <Button
            variant={activeTab === "qa" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("qa")}
            className="rounded-xl text-xs font-semibold gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            📊 Export QA Report (Audit AI)
          </Button>
        </div>

        {/* Filters Section */}
        <div className="rounded-xl bg-muted/40 p-4 border border-border/60 mt-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-3">
            <Filter className="h-3.5 w-3.5 text-primary" /> Filter Data Export
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Jenjang Pendidikan</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="mt-1 h-9 rounded-lg text-xs bg-background">
                  <SelectValue placeholder="Pilih Jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Jenjang</SelectItem>
                  <SelectItem value="TK">TK / PAUD</SelectItem>
                  <SelectItem value="SD">SD</SelectItem>
                  <SelectItem value="SMP">SMP</SelectItem>
                  <SelectItem value="SMA">SMA / SMK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Status Analisis</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1 h-9 rounded-lg text-xs bg-background">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="analyzed">Analisis Selesai</SelectItem>
                  <SelectItem value="queued">Menunggu (Queued)</SelectItem>
                  <SelectItem value="failed">Gagal / Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Nama Anak</Label>
              <Input
                type="text"
                placeholder="Cari nama anak..."
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="mt-1 h-9 rounded-lg text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Tanggal Mulai</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 h-9 rounded-lg text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Tanggal Akhir</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 h-9 rounded-lg text-xs bg-background"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Nomor WhatsApp</Label>
              <Input
                type="text"
                placeholder="Cari no WA..."
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="mt-1 h-9 rounded-lg text-xs bg-background"
              />
            </div>
          </div>
        </div>

        {/* Content & Action Buttons */}
        {activeTab === "standard" ? (
          <div className="space-y-3 mt-4">
            <div className="text-xs text-muted-foreground">
              Pilih format file untuk mengunduh seluruh data pengisian jawaban Q1-Q40 dan narasi analisis AI:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport("json")}
                disabled={loading}
                className="h-16 rounded-xl border-primary/30 bg-primary/5 hover:bg-primary/10 flex-col items-center justify-center gap-1.5 transition"
              >
                <FileJson className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-bold">Export JSON</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport("excel")}
                disabled={loading}
                className="h-16 rounded-xl border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 flex-col items-center justify-center gap-1.5 transition"
              >
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-bold">Export Excel (.xlsx)</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport("csv")}
                disabled={loading}
                className="h-16 rounded-xl border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 flex-col items-center justify-center gap-1.5 transition"
              >
                <FileCode className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-bold">Export CSV</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport("pdf")}
                disabled={loading}
                className="h-16 rounded-xl border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 flex-col items-center justify-center gap-1.5 transition"
              >
                <FileText className="h-5 w-5 text-rose-600" />
                <span className="text-xs font-bold">Export PDF (Gabungan)</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-900 dark:text-amber-200">
              <strong className="flex items-center gap-1.5 font-bold mb-1">
                <BarChart2 className="h-4 w-4 text-amber-600" /> Quality Assurance (QA) & AI Narrative Audit
              </strong>
              Laporan QA menyusun perbandingan matriks seluruh field narasi AI (Ringkasan, Akademik, Berpikir, Komunikasi, Karakter, Kesiapan, Potensi, Rekomendasi) antar peserta untuk mengevaluasi kemiripan dan pola keunikan narasi.
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExportQa("json")}
                disabled={loading}
                className="h-14 rounded-xl border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 flex items-center justify-center gap-2 transition"
              >
                <FileJson className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold">QA Report JSON</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExportQa("excel")}
                disabled={loading}
                className="h-14 rounded-xl border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center justify-center gap-2 transition"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold">QA Report Excel</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExportQa("csv")}
                disabled={loading}
                className="h-14 rounded-xl border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 flex items-center justify-center gap-2 transition"
              >
                <FileCode className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold">QA Report CSV</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExportQa("pdf")}
                disabled={loading}
                className="h-14 rounded-xl border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 flex items-center justify-center gap-2 transition"
              >
                <FileText className="h-4 w-4 text-rose-600" />
                <span className="text-xs font-bold">QA Report PDF</span>
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
            {loading ? "Memproses & menyiapkan data..." : "Siap mengeksport data hasil asesmen."}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl text-xs">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
