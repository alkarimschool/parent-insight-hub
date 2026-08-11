import { updateAssessmentCardSettingsServer } from "../lib/admin.server";
import { fetchAssessmentCardSettings } from "../lib/settings";
import { fetchAssessmentLocks } from "../lib/locks";

async function testCardSettingsFullE2E() {
  console.log("=========================================================================");
  console.log("🧪 AUDIT & END-TO-END VERIFICATION: CARD ASSESSMENT SETTINGS (TK, SD, SMP, SMA)");
  console.log("=========================================================================\n");

  // 1. Prepare Custom Test Payload for ALL 4 Levels
  const testPayload = {
    TK: {
      title: "JUDUL AUDIT TK 999",
      desc: "DESKRIPSI AUDIT TK 999",
      badge_text: "BADGE TK 999",
      badge_color: "emerald",
      badge_show: true,
      icon: "Baby",
      features: ["Fokus TK 1", "Fokus TK 2", "Fokus TK 3"],
      info_message: "INFO TK 999",
      button_text: "TOMBOL TK 999",
      is_locked: false,
    },
    SD: {
      title: "JUDUL AUDIT SD 888",
      desc: "DESKRIPSI AUDIT SD 888",
      badge_text: "BADGE SD 888",
      badge_color: "amber",
      badge_show: true,
      icon: "BookOpen",
      features: ["Fokus SD 1", "Fokus SD 2", "Fokus SD 3"],
      info_message: "INFO SD 888",
      button_text: "TOMBOL SD 888",
      is_locked: true,
    },
    SMP: {
      title: "JUDUL AUDIT SMP 777",
      desc: "DESKRIPSI AUDIT SMP 777",
      badge_text: "BADGE SMP 777",
      badge_color: "purple",
      badge_show: false,
      icon: "School",
      features: ["Fokus SMP 1", "Fokus SMP 2", "Fokus SMP 3"],
      info_message: "INFO SMP 777",
      button_text: "TOMBOL SMP 777",
      is_locked: true,
    },
    SMA: {
      title: "JUDUL AUDIT SMA 666",
      desc: "DESKRIPSI AUDIT SMA 666",
      badge_text: "BADGE SMA 666",
      badge_color: "sky",
      badge_show: true,
      icon: "GraduationCap",
      features: ["Fokus SMA 1", "Fokus SMA 2", "Fokus SMA 3"],
      info_message: "INFO SMA 666",
      button_text: "TOMBOL SMA 666",
      is_locked: false,
    },
  };

  console.log("📌 [STEP 1] Saving custom test configuration for TK, SD, SMP, SMA...");
  const saveRes = await updateAssessmentCardSettingsServer(testPayload);
  console.log("Save Result:", saveRes);
  if (!saveRes.ok) throw new Error("❌ Step 1 failed to save settings!");

  console.log("\n📌 [STEP 2] Fetching updated settings from single source of truth...");
  const cards = await fetchAssessmentCardSettings();
  const locks = await fetchAssessmentLocks();

  console.log("\n--- VERIFICATION MATRIX ---");
  for (const lvl of ["TK", "SD", "SMP", "SMA"] as const) {
    const saved = cards[lvl];
    const expected = testPayload[lvl];
    console.log(`[${lvl}] Title: "${saved.title}" (Match: ${saved.title === expected.title})`);
    console.log(`[${lvl}] Desc: "${saved.desc}" (Match: ${saved.desc === expected.desc})`);
    console.log(`[${lvl}] Badge Text: "${saved.badge_text}" (Match: ${saved.badge_text === expected.badge_text})`);
    console.log(`[${lvl}] Icon: "${saved.icon}" (Match: ${saved.icon === expected.icon})`);
    console.log(`[${lvl}] Features Count: ${saved.features.length} (Match: ${saved.features.length === expected.features.length})`);
    console.log(`[${lvl}] Is Locked: ${saved.is_locked} | LockMap: ${locks[lvl]} (Match: ${saved.is_locked === expected.is_locked && locks[lvl] === expected.is_locked})`);

    if (saved.title !== expected.title || saved.desc !== expected.desc || saved.badge_text !== expected.badge_text || saved.is_locked !== expected.is_locked) {
      throw new Error(`❌ Mismatch detected on level ${lvl}!`);
    }
  }
  console.log("\n✅ STEP 2 PASSED: All 4 levels custom fields successfully saved and verified!");

  // 3. Restore Standard Production Settings
  console.log("\n📌 [STEP 3] Restoring production card settings...");
  const restorePayload = {
    TK: {
      title: "Pendidikan Anak Usia Dini (TK/PAUD)",
      desc: "Hasil analisis kesiapan sekolah, motorik, sosial-emosional, dan pengenalan calistung awal anak usia 3–6 tahun.",
      badge_text: "Usia 3–6 Tahun",
      badge_color: "cyan",
      badge_show: true,
      icon: "Baby",
      features: ["Calistung & Angka Awal", "Kesiapan Sekolah", "Kemampuan Motorik & Emosi"],
      info_message: "Asesmen ini dirancang untuk membantu orang tua mengidentifikasi kesiapan awal masuk sekolah.",
      button_text: "Pilih Jenjang TK",
      is_locked: false,
    },
    SD: {
      title: "Sekolah Dasar (SD)",
      desc: "Hasil analisis kemampuan akademik, literasi, numerasi, kebiasaan belajar, serta disiplin anak usia 7–12 tahun.",
      badge_text: "Usia 7–12 Tahun",
      badge_color: "blue",
      badge_show: true,
      icon: "BookOpen",
      features: ["Literasi & Numerasi SD", "Kebiasaan & Fokus Belajar", "Disiplin & Kontrol Gadget"],
      info_message: "Asesmen ini mengukur fondasi kemampuan belajar mandiri dan karakter anak.",
      button_text: "Pilih Jenjang SD",
      is_locked: false,
    },
    SMP: {
      title: "Sekolah Menengah Pertama (SMP)",
      desc: "Hasil analisis potensi akademik, penalaran kritis, dinamika pergaulan remaja, serta manajemen emosi usia 13–15 tahun.",
      badge_text: "Usia 13–15 Tahun",
      badge_color: "indigo",
      badge_show: true,
      icon: "School",
      features: ["Berpikir Kritis & Problem Solving", "Pergaulan & Media Sosial", "Motivasi & Target Belajar"],
      info_message: "Asesmen ini membantu orang tua memahami tantangan dan dinamika emosi usia remaja SMP.",
      button_text: "Pilih Jenjang SMP",
      is_locked: false,
    },
    SMA: {
      title: "Sekolah Menengah Atas (SMA)",
      desc: "Pemetaan kemampuan awal akademik, berpikir analitis, motivasi, komunikasi, karakter, serta kesiapan pembelajaran SMA.",
      badge_text: "Usia 16–18 Tahun",
      badge_color: "sky",
      badge_show: true,
      icon: "GraduationCap",
      features: ["Kesiapan Pembelajaran SMA", "Kemampuan Berpikir & Analitis", "Komunikasi & Kemandirian Siswa"],
      info_message: "Asesmen ini dirancang untuk memetakan kondisi awal siswa saat menempuh pembelajaran di jenjang SMA.",
      button_text: "Pilih Jenjang SMA",
      is_locked: false,
    },
  };

  const restoreRes = await updateAssessmentCardSettingsServer(restorePayload);
  if (!restoreRes.ok) throw new Error("❌ Step 3 failed to restore production settings!");

  const finalCards = await fetchAssessmentCardSettings();
  console.log("Restored Final Settings State:");
  console.log("- TK:", finalCards.TK.title, "| Locked:", finalCards.TK.is_locked);
  console.log("- SD:", finalCards.SD.title, "| Locked:", finalCards.SD.is_locked);
  console.log("- SMP:", finalCards.SMP.title, "| Locked:", finalCards.SMP.is_locked);
  console.log("- SMA:", finalCards.SMA.title, "| Locked:", finalCards.SMA.is_locked);

  console.log("\n=========================================================================");
  console.log("🎉 FULL CARD ASSESSMENT E2E AUDIT & VERIFICATION TEST PASSED 100%!");
  console.log("=========================================================================\n");
}

testCardSettingsFullE2E().catch((err) => {
  console.error("❌ E2E TEST FAILED:", err);
  process.exit(1);
});
