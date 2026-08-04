import { supabaseAdmin } from "../integrations/supabase/client.server";

async function rebuildAssessmentLocks() {
  console.log("=========================================================================");
  console.log("🛠️ REBUILDING ASSESSMENT LOCKS IN SUPABASE DATABASE");
  console.log("=========================================================================\n");

  const initialLocks = [
    { education_level: "TK", is_locked: true, updated_at: new Date().toISOString() },
    { education_level: "SD", is_locked: true, updated_at: new Date().toISOString() },
    { education_level: "SMP", is_locked: true, updated_at: new Date().toISOString() },
    { education_level: "SMA", is_locked: false, updated_at: new Date().toISOString() },
    { education_level: "SMK", is_locked: true, updated_at: new Date().toISOString() },
  ];

  console.log("📌 [STEP 1] Upserting initial locks into assessment_locks table...");
  for (const lock of initialLocks) {
    const { error } = await supabaseAdmin
      .from("assessment_locks")
      .upsert(lock, { onConflict: "education_level" });

    if (error) {
      console.error(`❌ Failed to upsert lock for ${lock.education_level}:`, error);
    } else {
      console.log(`  - ${lock.education_level}: is_locked = ${lock.is_locked} (UPDATED)`);
    }
  }

  // Also sync website_settings assessment_cards
  console.log("\n📌 [STEP 2] Syncing website_settings assessment_cards JSON...");
  const { data: existing } = await supabaseAdmin.from("website_settings").select("id, data").eq("id", 1).maybeSingle();
  const currentObj = (existing?.data as any) || {};
  const cleanCurrent = currentObj?.data ?? currentObj;

  const cardsData = cleanCurrent.assessment_cards || {};
  for (const lock of initialLocks) {
    if (cardsData[lock.education_level]) {
      cardsData[lock.education_level].is_locked = lock.is_locked;
      if (lock.is_locked) {
        cardsData[lock.education_level].button_text = "Terkunci";
      } else {
        cardsData[lock.education_level].button_text = `Pilih Jenjang ${lock.education_level}`;
      }
    }
  }

  const mergedData = { ...cleanCurrent, assessment_cards: cardsData };
  delete (mergedData as any).data;

  if (existing?.id) {
    await supabaseAdmin.from("website_settings").update({ data: mergedData, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabaseAdmin.from("website_settings").insert({ id: 1, data: mergedData });
  }

  console.log("✅ STEP 2 PASSED: website_settings synced!");

  console.log("\n=========================================================================");
  console.log("🎉 REBUILD COMPLETE! DB TARGET STATE: TK=Locked, SD=Locked, SMP=Locked, SMA=Unlocked!");
  console.log("=========================================================================\n");
}

rebuildAssessmentLocks().catch(console.error);
