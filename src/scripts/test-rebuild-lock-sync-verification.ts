import { updateAssessmentCardSettingsServer } from "../lib/admin.server";
import { fetchAssessmentLocks } from "../lib/locks";

async function runRebuildLockSyncVerification() {
  console.log("=========================================================================");
  console.log("🧪 VERIFYING REBUILT LOCK/UNLOCK SINKRONISASI 100% (DB & FRONTEND)");
  console.log("=========================================================================\n");

  // 1. VERIFY INITIAL TARGET STATE
  console.log("📌 [STEP 1] Verifying initial target database state (TK=Locked, SD=Locked, SMP=Locked, SMA=Unlocked)...");
  const initialLocks = await fetchAssessmentLocks();
  console.log("Fetched Locks from DB:", initialLocks);

  if (initialLocks.TK !== true || initialLocks.SD !== true || initialLocks.SMP !== true || initialLocks.SMA !== false) {
    throw new Error("❌ STEP 1 FAILED: Initial database lock state is incorrect!");
  }
  console.log("✅ STEP 1 PASSED: Initial DB target state verified!");
  console.log("   🔒 TK  : Locked");
  console.log("   🔒 SD  : Locked");
  console.log("   🔒 SMP : Locked");
  console.log("   ✅ SMA : Unlocked");

  // 2. TOGGLE TEST: UNLOCK SMP
  console.log("\n📌 [STEP 2] Toggle test: Admin unlocks SMP...");
  const togglePayload = {
    TK: { title: "TK Test", desc: "Desc", is_locked: true },
    SD: { title: "SD Test", desc: "Desc", is_locked: true },
    SMP: { title: "SMP Test", desc: "Desc", is_locked: false },
    SMA: { title: "SMA Test", desc: "Desc", is_locked: false },
  };

  const toggleRes = await updateAssessmentCardSettingsServer(togglePayload);
  if (!toggleRes || !toggleRes.ok) throw new Error("❌ Toggle save failed!");

  const toggledLocks = await fetchAssessmentLocks();
  console.log("Toggled Locks from DB:", toggledLocks);

  if (toggledLocks.TK !== true || toggledLocks.SD !== true || toggledLocks.SMP !== false || toggledLocks.SMA !== false) {
    throw new Error("❌ STEP 2 FAILED: Toggle state mismatch!");
  }
  console.log("✅ STEP 2 PASSED: Toggle test succeeded! (SMP is now Unlocked)");
  console.log("   🔒 TK  : Locked");
  console.log("   🔒 SD  : Locked");
  console.log("   ✅ SMP : Unlocked");
  console.log("   ✅ SMA : Unlocked");

  // 3. RESTORE TARGET STATE: LOCK SMP
  console.log("\n📌 [STEP 3] Restoring final target state: Admin locks SMP again...");
  const targetPayload = {
    TK: { title: "Pendidikan Anak Usia Dini (TK/PAUD)", desc: "Hasil analisis...", is_locked: true },
    SD: { title: "Sekolah Dasar (SD)", desc: "Hasil analisis...", is_locked: true },
    SMP: { title: "Sekolah Menengah Pertama (SMP)", desc: "Hasil analisis...", is_locked: true },
    SMA: { title: "Sekolah Menengah Atas (SMA)", desc: "Pemetaan kemampuan...", is_locked: false },
  };

  const restoreRes = await updateAssessmentCardSettingsServer(targetPayload);
  if (!restoreRes || !restoreRes.ok) throw new Error("❌ Restore save failed!");

  const finalLocks = await fetchAssessmentLocks();
  console.log("Final Target Locks from DB:", finalLocks);

  if (finalLocks.TK !== true || finalLocks.SD !== true || finalLocks.SMP !== true || finalLocks.SMA !== false) {
    throw new Error("❌ STEP 3 FAILED: Restore target state failed!");
  }
  console.log("✅ STEP 3 PASSED: Final target state restored and verified 100%!");
  console.log("   🔒 TK  : Locked");
  console.log("   🔒 SD  : Locked");
  console.log("   🔒 SMP : Locked");
  console.log("   ✅ SMA : Unlocked");

  console.log("\n=========================================================================");
  console.log("🎉 ALL REBUILD LOCK SYNC VERIFICATION TESTS PASSED 100%!");
  console.log("=========================================================================\n");
}

runRebuildLockSyncVerification().catch((err) => {
  console.error("❌ VERIFICATION TEST FAILED:", err);
  process.exit(1);
});
