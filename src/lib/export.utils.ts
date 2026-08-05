/**
 * Utility functions for exporting Parent Awareness Assessment data to JSON, Excel (.xlsx/csv), CSV, and PDF formats.
 * Built for QA Audit & AI Narrative Comparison.
 */

export interface ExportAssessmentRow {
  id: string;
  created_at: string;
  child_name: string;
  parent_name: string;
  whatsapp: string;
  education_level: string;
  average_score: number | string;
  category: string;
  answers: Record<string, number | string>;
  ai_result: {
    ringkasan_kemampuan_awal?: string;
    area_yang_perlu_diperhatikan?: string | string[];
    kemampuan_awal_akademik?: string | string[];
    kemampuan_berpikir?: string | string[];
    kemampuan_komunikasi_dan_sosial?: string | string[];
    karakter_dan_kemandirian?: string | string[];
    kesiapan_mengikuti_pembelajaran_SMA?: string | string[];
    potensi_pengembangan?: string | string[];
    potensi_dan_kelebihan?: string | string[];
    rekomendasi_untuk_orang_tua?: string | string[];
    [key: string]: any;
  };
}

function fieldToString(fieldVal: any): string {
  if (typeof fieldVal === "string") return fieldVal;
  if (Array.isArray(fieldVal)) return fieldVal.join(" | ");
  if (typeof fieldVal === "object" && fieldVal !== null) return JSON.stringify(fieldVal);
  return String(fieldVal || "");
}

/**
 * 📥 Export to JSON
 */
export function exportToJson(data: ExportAssessmentRow[], filename = "export_hasil_analisis_ai.json") {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, filename);
}

/**
 * 📄 Export to CSV (UTF-8 BOM for Excel Compatibility)
 */
export function exportToCsv(data: ExportAssessmentRow[], filename = "export_hasil_analisis_ai.csv") {
  if (!data || data.length === 0) return;

  const headers = [
    "ID Assessment",
    "Tanggal",
    "Nama Anak",
    "Nama Orang Tua",
    "No WhatsApp",
    "Jenjang",
    "Skor Rata-Rata",
    "Kategori",
    // Answers Q1..Q40
    ...Array.from({ length: 40 }, (_, i) => `Q${i + 1}_Skor`),
    // AI Fields
    "Ringkasan Kemampuan Awal",
    "Area yang Perlu Diperhatikan",
    "Kemampuan Awal Akademik",
    "Kemampuan Berpikir",
    "Kemampuan Komunikasi & Sosial",
    "Karakter & Kemandirian",
    "Kesiapan Pembelajaran",
    "Potensi Pengembangan",
    "Potensi & Kelebihan",
    "Rekomendasi Orang Tua",
  ];

  const rows = data.map((row) => {
    const ai = row.ai_result || {};
    const ansMap = row.answers || {};

    const qScores = Array.from({ length: 40 }, (_, i) => {
      const val = ansMap[`q_${i + 1}`] ?? ansMap[`Q${i + 1}`] ?? ansMap[`q_sma_${i + 1}`] ?? ansMap[`q_smp_${i + 1}`] ?? ansMap[`q_sd_${i + 1}`] ?? ansMap[`q_tk_${i + 1}`] ?? "";
      return String(val);
    });

    return [
      row.id,
      row.created_at,
      row.child_name,
      row.parent_name,
      row.whatsapp,
      row.education_level,
      String(row.average_score),
      row.category,
      ...qScores,
      fieldToString(ai.ringkasan_kemampuan_awal),
      fieldToString(ai.area_yang_perlu_diperhatikan),
      fieldToString(ai.kemampuan_awal_akademik),
      fieldToString(ai.kemampuan_berpikir),
      fieldToString(ai.kemampuan_komunikasi_dan_sosial),
      fieldToString(ai.karakter_dan_kemandirian),
      fieldToString(ai.kesiapan_mengikuti_pembelajaran_SMA || ai.kesiapan_sekolah || ai.kesiapan_sd || ai.kesiapan_smp),
      fieldToString(ai.potensi_pengembangan),
      fieldToString(ai.potensi_dan_kelebihan),
      fieldToString(ai.rekomendasi_untuk_orang_tua),
    ];
  });

  const csvContent = "\uFEFF" + [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => r.map(escapeCsvCell).join(",")),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

/**
 * 📊 Export to Excel (.xlsx / Excel-formatted CSV)
 */
export function exportToExcel(data: ExportAssessmentRow[], filename = "export_hasil_analisis_ai.xlsx") {
  // Using UTF-8 BOM CSV with .xlsx filename or .csv compatibility
  exportToCsv(data, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

function escapeCsvCell(val: any): string {
  const str = String(val ?? "").replace(/"/g, '""');
  if (str.includes(",") || str.includes("\n") || str.includes("\r") || str.includes('"')) {
    return `"${str}"`;
  }
  return `"${str}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 📑 Export PDF (Unified Multi-page PDF Report with Page Break per Participant)
 */
export function exportToPdf(data: ExportAssessmentRow[], filename = "export_laporan_gabungan_ai.pdf") {
  if (!data || data.length === 0) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Silakan izinkan popup browser untuk mengunduh/mencetak PDF.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Gabungan Audit AI - Parent Awareness Assessment</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1e293b;
          margin: 0;
          padding: 0;
          background: #ffffff;
        }
        .page-break {
          page-break-before: always;
        }
        .participant-container {
          padding-bottom: 20px;
        }
        .header-card {
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .header-title {
          font-size: 16pt;
          font-weight: bold;
          color: #0f172a;
          margin: 0 0 8px 0;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 10pt;
        }
        .meta-item strong {
          color: #475569;
        }
        .section-title {
          font-size: 12pt;
          font-weight: bold;
          color: #1e40af;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 4px;
          margin-top: 18px;
          margin-bottom: 10px;
        }
        .field-box {
          background-color: #fafafa;
          border-left: 4px solid #3b82f6;
          padding: 10px 14px;
          margin-bottom: 10px;
          border-radius: 0 6px 6px 0;
        }
        .field-label {
          font-weight: bold;
          font-size: 10pt;
          color: #334155;
          margin-bottom: 4px;
        }
        .field-content {
          font-size: 10pt;
          color: #0f172a;
          white-space: pre-wrap;
        }
        ul {
          margin: 4px 0;
          padding-left: 20px;
        }
        li {
          margin-bottom: 4px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 9pt;
          color: #94a3b8;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="padding: 10px; background: #e0f2fe; text-align: center; margin-bottom: 20px; border-radius: 6px;">
        <strong>Silakan Pilih 'Save as PDF' (Simpan sebagai PDF) pada dialog cetak browser:</strong>
        <button onclick="window.print()" style="margin-left: 15px; padding: 6px 14px; font-weight: bold; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer;">🖨️ Cetak / Simpan PDF</button>
      </div>

      ${data.map((row, index) => {
        const ai = row.ai_result || {};
        return `
          <div class="participant-container ${index > 0 ? "page-break" : ""}">
            <div class="header-card">
              <div class="header-title">📋 LAPORAN ANALISIS AI - ${escapeHtml(row.child_name || "Peserta")}</div>
              <div class="meta-grid">
                <div class="meta-item"><strong>ID Assessment:</strong> ${escapeHtml(row.id)}</div>
                <div class="meta-item"><strong>Tanggal:</strong> ${escapeHtml(new Date(row.created_at).toLocaleString("id-ID"))}</div>
                <div class="meta-item"><strong>Nama Orang Tua:</strong> ${escapeHtml(row.parent_name || "-")}</div>
                <div class="meta-item"><strong>No WhatsApp:</strong> ${escapeHtml(row.whatsapp || "-")}</div>
                <div class="meta-item"><strong>Jenjang:</strong> ${escapeHtml(row.education_level)}</div>
                <div class="meta-item"><strong>Skor Rata-Rata:</strong> ${row.average_score} / 5.00</div>
                <div class="meta-item" style="grid-column: span 2;"><strong>Kategori:</strong> ${escapeHtml(row.category || "-")}</div>
              </div>
            </div>

            <div class="section-title">📊 HASIL NARRATIVE AI ENGINE</div>

            <div class="field-box">
              <div class="field-label">1. Ringkasan Kemampuan Awal</div>
              <div class="field-content">${escapeHtml(fieldToString(ai.ringkasan_kemampuan_awal))}</div>
            </div>

            <div class="field-box">
              <div class="field-label">2. Area yang Perlu Diperhatikan</div>
              <div class="field-content">${formatListHtml(ai.area_yang_perlu_diperhatikan)}</div>
            </div>

            <div class="field-box">
              <div class="field-label">3. Kemampuan Awal Akademik</div>
              <div class="field-content">${formatListHtml(ai.kemampuan_awal_akademik)}</div>
            </div>

            <div class="field-box">
              <div class="field-label">4. Kemampuan Berpikir</div>
              <div class="field-content">${formatListHtml(ai.kemampuan_berpikir)}</div>
            </div>

            <div class="field-box">
              <div class="field-label">5. Kemampuan Komunikasi dan Sosial</div>
              <div class="field-content">${formatListHtml(ai.kemampuan_komunikasi_dan_sosial)}</div>
            </div>

            <div class="field-box">
              <div class="field-label">6. Karakter dan Kemandirian</div>
              <div class="field-content">${formatListHtml(ai.karakter_dan_kemandirian)}</div>
            </div>

            <div class="field-box">
              <div class="field-label">7. Kesiapan Mengikuti Pembelajaran (${escapeHtml(row.education_level)})</div>
              <div class="field-content">${formatListHtml(ai.kesiapan_mengikuti_pembelajaran_SMA || ai.kesiapan_sekolah || ai.kesiapan_sd || ai.kesiapan_smp)}</div>
            </div>

            <div class="field-box">
              <div class="field-label">8. Potensi Pengembangan</div>
              <div class="field-content">${formatListHtml(ai.potensi_pengembangan)}</div>
            </div>

            <div class="field-box">
              <div class="field-label">9. Potensi dan Kelebihan</div>
              <div class="field-content">${formatListHtml(ai.potensi_dan_kelebihan)}</div>
            </div>

            <div class="field-box">
              <div class="field-label">10. Rekomendasi untuk Orang Tua</div>
              <div class="field-content">${formatListHtml(ai.rekomendasi_untuk_orang_tua)}</div>
            </div>

            <div class="footer">Parent Awareness Assessment — QA Audit Report (${index + 1} / ${data.length})</div>
          </div>
        `;
      }).join("")}

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 600);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * 📊 Export QA Audit Summary Report
 */
export function exportQaReport(data: ExportAssessmentRow[], format: "json" | "csv" | "excel" | "pdf") {
  if (!data || data.length === 0) return;

  const totalCount = data.length;
  const levelCounts: Record<string, number> = {};
  let totalScoreSum = 0;

  data.forEach((r) => {
    const lvl = (r.education_level || "LAINNYA").toUpperCase();
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
    totalScoreSum += Number(r.average_score || 0);
  });

  const overallAvgScore = totalCount > 0 ? (totalScoreSum / totalCount).toFixed(2) : "0.00";

  const qaSummary = {
    laporan_qa: "QA Audit & Comparative Narrative Report",
    tanggal_export: new Date().toISOString(),
    metrik_ringkasan: {
      jumlah_data: totalCount,
      jumlah_jenjang: Object.keys(levelCounts).length,
      sebaran_jenjang: levelCounts,
      rata_rata_skor: overallAvgScore,
    },
    daftar_peserta_audit: data.map((r) => ({
      id: r.id,
      nama_anak: r.child_name,
      jenjang: r.education_level,
      skor_rata_rata: r.average_score,
      kategori: r.category,
      hasil_ai: {
        ringkasan: fieldToString(r.ai_result?.ringkasan_kemampuan_awal),
        area_perhatian: fieldToString(r.ai_result?.area_yang_perlu_diperhatikan),
        akademik: fieldToString(r.ai_result?.kemampuan_awal_akademik),
        berpikir: fieldToString(r.ai_result?.kemampuan_berpikir),
        komunikasi: fieldToString(r.ai_result?.kemampuan_komunikasi_dan_sosial),
        karakter: fieldToString(r.ai_result?.karakter_dan_kemandirian),
        kesiapan_sekolah: fieldToString(r.ai_result?.kesiapan_mengikuti_pembelajaran_SMA || r.ai_result?.kesiapan_sekolah),
        potensi_pengembangan: fieldToString(r.ai_result?.potensi_pengembangan),
        kelebihan: fieldToString(r.ai_result?.potensi_dan_kelebihan),
        rekomendasi: fieldToString(r.ai_result?.rekomendasi_untuk_orang_tua),
      },
    })),
  };

  if (format === "json") {
    exportToJson([qaSummary as any], "qa_report_audit_ai.json");
  } else if (format === "csv" || format === "excel") {
    exportToCsv(data, `qa_report_audit_ai.${format === "excel" ? "xlsx" : "csv"}`);
  } else if (format === "pdf") {
    exportToPdf(data, "qa_report_audit_ai.pdf");
  }
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatListHtml(val: any): string {
  if (Array.isArray(val)) {
    return `<ul>${val.map((item) => `<li>${escapeHtml(String(item))}</li>`).join("")}</ul>`;
  }
  return escapeHtml(fieldToString(val));
}
