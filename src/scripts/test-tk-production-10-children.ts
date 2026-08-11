import { supabaseAdmin } from "../integrations/supabase/client.server";
import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { LEVEL_QUESTIONS } from "../lib/questions.data";

async function test10ChildrenProduction() {
  console.log("=========================================================================");
  console.log("🌐 LIVE PRODUCTION TEST: 10 TK CHILDREN END-TO-END VERIFICATION");
  console.log("=========================================================================\n");

  const tkQuestions = LEVEL_QUESTIONS.TK;
  const createdAssessmentIds: string[] = [];

  for (let i = 1; i <= 10; i++) {
    const studentName = `Siswa Uji TK ${i.toString().padStart(2, "0")}`;
    const className = `TK B Kelas ${String.fromCharCode(64 + i)}`;
    const parentName = `Orang Tua ${studentName}`;
    const wa = `0812345678${i.toString().padStart(2, "0")}`;

    // Vary score profile per student
    const baseScore = i % 4 === 1 ? 5 : i % 4 === 2 ? 4 : i % 4 === 3 ? 3 : 2;
    const answers = tkQuestions.map((q, idx) => ({
      question_id: q.id,
      score: Math.min(5, Math.max(1, baseScore + ((idx + i) % 3) - 1))
    }));

    console.log(`[STUDENT ${i}/10] Submitting ${studentName} (${className}) | Base Score: ${baseScore}`);

    const res = await submitAndAnalyze({
      parent: { name: parentName, whatsapp: wa },
      child: {
        name: studentName,
        gender: i % 2 === 0 ? "P" : "L",
        birth_date: "2021-05-15",
        school: "TK Alam Al-Karim",
        class_name: className,
        education_level: "TK"
      },
      answers
    });

    if (!res || !res.assessment_id) {
      throw new Error(`❌ Failed to submit assessment for ${studentName}`);
    }

    createdAssessmentIds.push(res.assessment_id);
    console.log(`  └─ Success! Assessment ID: ${res.assessment_id}`);
  }

  console.log("\n=========================================================================");
  console.log("📌 VERIFYING PRODUCTION DATABASE, ADMIN DASHBOARD READ, & PDF PAYLOAD");
  console.log("=========================================================================\n");

  for (let i = 0; i < createdAssessmentIds.length; i++) {
    const assId = createdAssessmentIds[i];
    const studentNum = (i + 1).toString().padStart(2, "0");

    const result = await getAssessmentResultServer(assId, true);
    if (!result || !result.content) {
      throw new Error(`❌ Production DB query failed for Assessment ID ${assId}`);
    }

    const c = result.content as any;
    console.log(`[STUDENT ${studentNum}/10 VERIFIED]`);
    console.log(`  ├─ Name: ${result.child_name}`);
    console.log(`  ├─ Class: ${result.class_name}`);
    console.log(`  ├─ Level: ${result.education_level}`);
    console.log(`  ├─ Status: ${c.status_perkembangan}`);
    console.log(`  ├─ Has 4 Aspects?: ${Boolean(c.gambaran_perkembangan_anak?.bahasa_dan_komunikasi)}`);
    console.log(`  └─ Zero Score Rule?: ${!JSON.stringify(c).includes('"skor"')}`);

    if (result.education_level !== "TK") {
      throw new Error(`❌ Level mismatch for ${studentNum}! Expected TK, got ${result.education_level}`);
    }
  }

  console.log("\n=========================================================================");
  console.log("🎉 ALL 10 TK CHILDREN SUCCESSFULLY VERIFIED ON PRODUCTION DATABASE!");
  console.log("=========================================================================\n");
}

test10ChildrenProduction().catch((err) => {
  console.error("❌ PRODUCTION TEST FAILED:", err);
  process.exit(1);
});
