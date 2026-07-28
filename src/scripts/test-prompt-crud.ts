import { getPromptServer, updatePromptServer } from "../lib/admin.server";
import { EducationLevel } from "../lib/questions.data";

async function testPromptCrud() {
  console.log("==========================================================================");
  console.log("🚀 STARTING E2E AUDIT & TEST FOR AI PROMPTS ACROSS ALL EDUCATION LEVELS");
  console.log("==========================================================================\n");

  const levels: EducationLevel[] = ["TK", "SD", "SMP", "SMA"];
  const timestamp = Date.now();

  const customPrompts: Record<EducationLevel, { system: string; template: string }> = {
    TK: {
      system: `CUSTOM SYSTEM PROMPT TK TEST ${timestamp} - Psikolog Usia Dini`,
      template: `CUSTOM USER TEMPLATE TK TEST ${timestamp} - Data Anak TK: {{child_name}}`,
    },
    SD: {
      system: `CUSTOM SYSTEM PROMPT SD TEST ${timestamp} - Konsultan Akademik SD`,
      template: `CUSTOM USER TEMPLATE SD TEST ${timestamp} - Data Anak SD: {{child_name}}`,
    },
    SMP: {
      system: `CUSTOM SYSTEM PROMPT SMP TEST ${timestamp} - Psikolog Remaja SMP`,
      template: `CUSTOM USER TEMPLATE SMP TEST ${timestamp} - Data Siswa SMP: {{child_name}}`,
    },
    SMA: {
      system: `CUSTOM SYSTEM PROMPT SMA TEST ${timestamp} - Konsultan Karir SMA`,
      template: `CUSTOM USER TEMPLATE SMA TEST ${timestamp} - Data Siswa SMA: {{child_name}}`,
    },
  };

  // STEP 1: Save custom prompts for all levels
  console.log("1. Saving custom prompts for ALL levels to database...");
  for (const lvl of levels) {
    const saveRes = await updatePromptServer({
      education_level: lvl,
      name: `Prompt AI Custom ${lvl}`,
      system_prompt: customPrompts[lvl].system,
      user_template: customPrompts[lvl].template,
      is_active: true,
    });

    if (!saveRes.ok || !saveRes.data) {
      throw new Error(`❌ Failed to save prompt for level ${lvl}: ${saveRes.error}`);
    }
    console.log(`   ✓ Saved prompt for level ${lvl} successfully.`);
  }

  // STEP 2: Fetch and verify stored prompts for all levels
  console.log("\n2. Verifying saved prompts from database (LOAD PROMPT)...");
  for (const lvl of levels) {
    const loadedPrompt = await getPromptServer(lvl);
    
    if (loadedPrompt.system_prompt !== customPrompts[lvl].system) {
      throw new Error(`❌ Level ${lvl} System Prompt mismatch!\nExpected: ${customPrompts[lvl].system}\nGot: ${loadedPrompt.system_prompt}`);
    }
    if (loadedPrompt.user_template !== customPrompts[lvl].template) {
      throw new Error(`❌ Level ${lvl} User Template mismatch!\nExpected: ${customPrompts[lvl].template}\nGot: ${loadedPrompt.user_template}`);
    }

    console.log(`   ✓ Level ${lvl} verified: 100% match with saved database record!`);
  }

  // STEP 3: Verify level isolation (updating TK should not alter SD/SMP/SMA/SMK)
  console.log("\n3. Verifying Multi-Jenjang Isolation (Update TK prompt)...");
  const tkUpdateTimestamp = Date.now() + 999;
  const newTkSystem = `NEW UPDATED TK SYSTEM PROMPT ${tkUpdateTimestamp}`;
  const newTkTemplate = `NEW UPDATED TK USER TEMPLATE ${tkUpdateTimestamp}`;

  await updatePromptServer({
    education_level: "TK",
    name: "Prompt AI TK Version 2",
    system_prompt: newTkSystem,
    user_template: newTkTemplate,
    is_active: true,
  });

  const updatedTk = await getPromptServer("TK");
  if (updatedTk.system_prompt !== newTkSystem) {
    throw new Error("❌ TK prompt was not updated properly.");
  }
  console.log("   ✓ TK prompt updated successfully.");

  // Check SD to ensure it remains intact
  const sdCheck = await getPromptServer("SD");
  if (sdCheck.system_prompt !== customPrompts.SD.system) {
    throw new Error("❌ Level Isolation Failure! Updating TK changed SD prompt!");
  }
  console.log("   ✓ Level Isolation Verified: Updating TK did NOT alter SD prompt!");

  console.log("\n==========================================================================");
  console.log("🎉 ALL E2E PROMPT SAVE & LOAD TESTS PASSED 100% SUCCESSFULLY!");
  console.log("==========================================================================");
}

testPromptCrud().catch((err) => {
  console.error("\n❌ E2E TEST FAILED:", err);
  process.exit(1);
});
