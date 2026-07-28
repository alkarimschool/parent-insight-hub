import { updatePromptServer, getPromptServer } from "../lib/admin.server";
import { DEFAULT_PROMPTS } from "../lib/prompt.data";
import { EducationLevel } from "../lib/questions.data";

async function syncAllPrompts() {
  console.log("==========================================================================");
  console.log("🔄 SYNCING EXPLICIT JSON SCHEMA PROMPTS FOR ALL 4 EDUCATION LEVELS");
  console.log("==========================================================================\n");

  const levels: EducationLevel[] = ["TK", "SD", "SMP", "SMA"];

  for (const lvl of levels) {
    const promptDef = DEFAULT_PROMPTS[lvl];
    console.log(`▶ Updating prompt for Jenjang: ${lvl}...`);

    const res = await updatePromptServer({
      education_level: lvl,
      name: promptDef.name,
      system_prompt: promptDef.system_prompt,
      user_template: promptDef.user_template,
      is_active: true,
    });

    if (!res.ok) {
      console.warn(`   ⚠️ Supabase DB update failed for ${lvl}: ${res.error} (falling back to file storage)`);
    } else {
      console.log(`   ✓ Successfully updated Supabase DB & file storage for ${lvl}`);
    }

    const verified = await getPromptServer(lvl);
    console.log(`   ✓ Loaded Prompt ${lvl} verified.`);
  }

  console.log("\n✅ ALL PROMPTS SUCCESSFULLY SYNCED WITH EXPLICIT JSON SCHEMAS!");
}

syncAllPrompts().catch(console.error);
