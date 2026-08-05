import { supabaseAdmin } from "../integrations/supabase/client.server";
import { LEVEL_QUESTIONS } from "../lib/questions.data";

async function seedLqzQuestions() {
  console.log("=================================================");
  console.log("🌱 SEEDING QUESTIONS INTO SUPABASE PROJECT lqzicsebjjzhdsduqdcf");
  console.log("=================================================\n");

  const levels = ["TK", "SD", "SMP", "SMA"] as const;
  let totalInserted = 0;

  for (const level of levels) {
    const questions = LEVEL_QUESTIONS[level];
    console.log(`Processing ${questions.length} questions for level: ${level}...`);

    for (const q of questions) {
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

      const { data: existingQ } = await supabaseAdmin
        .from("questions")
        .select("id")
        .eq("education_level", level)
        .eq("order_index", q.order_index)
        .maybeSingle();

      if (!existingQ) {
        const { error: insErr } = await supabaseAdmin.from("questions").insert({
          text: q.text,
          order_index: q.order_index,
          category_id: catId,
          education_level: level,
          is_active: true,
        });

        if (!insErr) totalInserted++;
      }
    }
  }

  console.log(`\n✅ Seeding complete! ${totalInserted} new questions inserted.`);

  const { count } = await supabaseAdmin.from("questions").select("*", { count: "exact" });
  console.log(`📊 Total questions in database: ${count}`);

  console.log("\n=================================================");
}

seedLqzQuestions().catch(console.error);
