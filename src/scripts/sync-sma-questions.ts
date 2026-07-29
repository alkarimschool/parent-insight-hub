import { supabaseAdmin } from "../integrations/supabase/client.server";
import { LEVEL_QUESTIONS } from "../lib/questions.data";
import { updatePromptServer } from "../lib/admin.server";
import { DEFAULT_PROMPTS } from "../lib/prompt.data";

async function syncSmaQuestionsAndPrompt() {
  console.log("==========================================================================");
  console.log("🔄 SYNCING NEW 15 SMA QUESTIONS & PROMPT FOR CLASS X ASSESSMENT");
  console.log("==========================================================================\n");

  // 1. Sync SMA prompt
  const promptDef = DEFAULT_PROMPTS.SMA;
  console.log("▶ Syncing SMA System Prompt...");
  const promptRes = await updatePromptServer({
    education_level: "SMA",
    name: promptDef.name,
    system_prompt: promptDef.system_prompt,
    user_template: promptDef.user_template,
    is_active: true,
  });
  console.log("   ✓ Prompt update result:", promptRes.ok ? "SUCCESS" : promptRes.error);

  // 2. Delete existing SMA questions in DB to force re-seed with 15 new questions
  console.log("▶ Deleting old SMA questions from Supabase DB...");
  const { error: delErr } = await supabaseAdmin.from("questions").delete().eq("education_level", "SMA");
  if (delErr) {
    console.warn("   ⚠️ Warning deleting old questions:", delErr.message);
  } else {
    console.log("   ✓ Deleted old SMA questions from DB.");
  }

  // 3. Re-seed the 15 new SMA questions
  console.log("▶ Seeding 15 new SMA questions...");
  const smaQuestions = LEVEL_QUESTIONS.SMA;
  for (const q of smaQuestions) {
    let catId: string | null = null;
    if (q.category_name) {
      const { data: existingCat } = await supabaseAdmin
        .from("question_categories")
        .select("id")
        .eq("name", q.category_name)
        .maybeSingle();

      if (existingCat) {
        catId = existingCat.id;
      } else {
        const { data: newCat } = await supabaseAdmin
          .from("question_categories")
          .insert({
            name: q.category_name,
            slug: q.category_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            order_index: q.order_index,
          })
          .select("id")
          .single();
        if (newCat) catId = newCat.id;
      }
    }

    const { data: newQ, error: qErr } = await supabaseAdmin
      .from("questions")
      .insert({
        text: q.text,
        order_index: q.order_index,
        category_id: catId,
        education_level: "SMA",
        is_active: true,
      })
      .select("id, text, order_index")
      .single();

    if (qErr) {
      console.warn(`   ⚠️ Error inserting Q${q.order_index}:`, qErr.message);
    } else {
      console.log(`   ✓ Inserted Q${q.order_index}: ${q.text.substring(0, 45)}...`);
    }
  }

  console.log("\n✅ SMA 15 QUESTIONS & PROMPT SUCCESSFULLY SYNCED!");
}

syncSmaQuestionsAndPrompt().catch(console.error);
