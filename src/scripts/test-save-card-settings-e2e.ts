import { updateAssessmentCardSettingsServer } from "../lib/admin.server";
import { fetchAssessmentLocks } from "../lib/locks";
import { fetchAssessmentCardSettings } from "../lib/settings";

async function testSaveCardSettingsE2e() {
  console.log("=========================================================================");
  console.log("🧪 TESTING CARD SETTINGS SAVE E2E (SUPABASE CLIENT & ADMIN)");
  console.log("=========================================================================\n");

  const testPayload = {
    TK: { title: "TK E2E Test", desc: "Deskripsi TK E2E", is_locked: true },
    SD: { title: "SD E2E Test", desc: "Deskripsi SD E2E", is_locked: false },
    SMP: { title: "SMP E2E Test", desc: "Deskripsi SMP E2E", is_locked: true },
    SMA: { title: "SMA E2E Test", desc: "Deskripsi SMA E2E", is_locked: false },
  };

  console.log("📌 [STEP 1] Executing updateAssessmentCardSettingsServer...");
  const res = await updateAssessmentCardSettingsServer(testPayload);
  console.log("Update Result:", res);

  if (!res || !res.ok) {
    throw new Error(`❌ SAVE FAILED: ${res?.error}`);
  }
  console.log("✅ STEP 1 PASSED: Save function returned ok: true!");

  console.log("\n📌 [STEP 2] Verifying database values via fetchAssessmentLocks...");
  const locks = await fetchAssessmentLocks();
  console.log("Fetched Locks:", locks);

  if (locks.TK !== true || locks.SD !== false || locks.SMP !== true || locks.SMA !== false) {
    throw new Error("❌ STEP 2 FAILED: Lock status mismatch in database!");
  }
  console.log("✅ STEP 2 PASSED: Locks verified in Supabase Database!");

  console.log("\n📌 [STEP 3] Verifying card settings via fetchAssessmentCardSettings...");
  const cardSettings = await fetchAssessmentCardSettings();
  console.log("Fetched Card Settings is_locked:", {
    TK: cardSettings.TK.is_locked,
    SD: cardSettings.SD.is_locked,
    SMP: cardSettings.SMP.is_locked,
    SMA: cardSettings.SMA.is_locked,
  });

  if (cardSettings.TK.is_locked !== true || cardSettings.SD.is_locked !== false || cardSettings.SMP.is_locked !== true || cardSettings.SMA.is_locked !== false) {
    throw new Error("❌ STEP 3 FAILED: Card settings is_locked mismatch!");
  }
  console.log("✅ STEP 3 PASSED: Card settings verified!");

  console.log("\n=========================================================================");
  console.log("🎉 ALL E2E CARD SETTINGS SAVE TESTS PASSED 100%!");
  console.log("=========================================================================\n");
}

testSaveCardSettingsE2e().catch((err) => {
  console.error("❌ E2E TEST FAILED:", err);
  process.exit(1);
});
