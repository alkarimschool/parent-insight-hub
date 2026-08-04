import { updateAssessmentCardSettingsServer } from "../lib/admin.server";
import { fetchAssessmentCardSettings } from "../lib/settings";
import { fetchAssessmentLocks } from "../lib/locks";

async function testCardsLockUnlock() {
  console.log("=========================================================================");
  console.log("🧪 TESTING CARD ASSESSMENT LOCK/UNLOCK PERSISTENCE & SYNCHRONIZATION");
  console.log("=========================================================================\n");

  // 1. Lock TK, SD, SMP and Unlock SMA
  console.log("📌 [TEST 1] Setting TK=Locked, SD=Locked, SMP=Locked, SMA=Unlocked...");
  const payload1 = {
    TK: { title: "TK Test", desc: "Desc TK", is_locked: true },
    SD: { title: "SD Test", desc: "Desc SD", is_locked: true },
    SMP: { title: "SMP Test", desc: "Desc SMP", is_locked: true },
    SMA: { title: "SMA Test", desc: "Desc SMA", is_locked: false },
  };

  const saveRes1 = await updateAssessmentCardSettingsServer(payload1);
  console.log("Save Response 1:", saveRes1);
  if (!saveRes1.ok) throw new Error("❌ Save 1 failed!");

  // Fetch updated settings
  const cards1 = await fetchAssessmentCardSettings();
  const locks1 = await fetchAssessmentLocks();

  console.log("Verified Settings State 1:");
  console.log("- TK  is_locked:", cards1.TK.is_locked, "| LockMap:", locks1.TK);
  console.log("- SD  is_locked:", cards1.SD.is_locked, "| LockMap:", locks1.SD);
  console.log("- SMP is_locked:", cards1.SMP.is_locked, "| LockMap:", locks1.SMP);
  console.log("- SMA is_locked:", cards1.SMA.is_locked, "| LockMap:", locks1.SMA);

  if (cards1.TK.is_locked !== true || cards1.SD.is_locked !== true || cards1.SMP.is_locked !== true || cards1.SMA.is_locked !== false) {
    throw new Error("❌ TEST 1 FAILED: Lock status mismatch!");
  }
  console.log("✅ TEST 1 PASSED: TK, SD, SMP are locked & SMA is unlocked!");

  // 2. Unlock ALL levels (TK=Unlocked, SD=Unlocked, SMP=Unlocked, SMA=Unlocked)
  console.log("\n📌 [TEST 2] Setting ALL levels to Unlocked...");
  const payload2 = {
    TK: { title: "Pendidikan Anak Usia Dini (TK/PAUD)", desc: "Hasil analisis kesiapan...", is_locked: false },
    SD: { title: "Sekolah Dasar (SD)", desc: "Hasil analisis kemampuan...", is_locked: false },
    SMP: { title: "Sekolah Menengah Pertama (SMP)", desc: "Hasil analisis potensi...", is_locked: false },
    SMA: { title: "Sekolah Menengah Atas (SMA)", desc: "Pemetaan kemampuan...", is_locked: false },
  };

  const saveRes2 = await updateAssessmentCardSettingsServer(payload2);
  console.log("Save Response 2:", saveRes2);
  if (!saveRes2.ok) throw new Error("❌ Save 2 failed!");

  const cards2 = await fetchAssessmentCardSettings();
  const locks2 = await fetchAssessmentLocks();

  console.log("Verified Settings State 2:");
  console.log("- TK  is_locked:", cards2.TK.is_locked, "| LockMap:", locks2.TK);
  console.log("- SD  is_locked:", cards2.SD.is_locked, "| LockMap:", locks2.SD);
  console.log("- SMP is_locked:", cards2.SMP.is_locked, "| LockMap:", locks2.SMP);
  console.log("- SMA is_locked:", cards2.SMA.is_locked, "| LockMap:", locks2.SMA);

  if (cards2.TK.is_locked !== false || cards2.SD.is_locked !== false || cards2.SMP.is_locked !== false || cards2.SMA.is_locked !== false) {
    throw new Error("❌ TEST 2 FAILED: Unlocking all levels failed!");
  }
  console.log("✅ TEST 2 PASSED: All levels are successfully unlocked!");

  console.log("\n=========================================================================");
  console.log("🎉 ALL CARD ASSESSMENT LOCK/UNLOCK TESTS PASSED 100%!");
  console.log("=========================================================================\n");
}

testCardsLockUnlock().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
