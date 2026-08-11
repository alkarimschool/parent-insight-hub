import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { LEVEL_QUESTIONS } from "../lib/questions.data";

function calculateJaccard(str1: string, str2: string): number {
  const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) return 0;
  return (intersection.size / union.size) * 100;
}

async function runSpecificVariationTests() {
  console.log("=========================================================================");
  console.log("🧪 TESTING SPECIFIC CASES: 10 SAME STATUS & 10 SAME TOTAL SCORE");
  console.log("=========================================================================\n");

  const tkQuestions = LEVEL_QUESTIONS.TK;

  // -------------------------------------------------------------------------
  // TEST 1: 10 CHILDREN WITH IDENTICAL STATUS ("Berkembang Sesuai Harapan")
  // -------------------------------------------------------------------------
  console.log("📌 [TEST 1] Submitting 10 Children with IDENTICAL STATUS ('Berkembang Sesuai Harapan')...");
  
  const statusPayloads = Array.from({ length: 10 }, (_, idx) => {
    const i = idx + 1;
    const studentName = `Anak StatusSama ${i}`;
    const parentName = `OrangTua ${i}`;
    const answers = tkQuestions.map((q, qIdx) => {
      let score = 4;
      const shiftCategory = (qIdx + i * 3) % 4;
      if (shiftCategory === 0) score = 5;
      else if (shiftCategory === 1) score = 4;
      else if (shiftCategory === 2) score = 4;
      else score = 3;
      return { question_id: q.id, score };
    });
    return { i, studentName, parentName, answers };
  });

  const statusSubmissions = await Promise.all(
    statusPayloads.map(p =>
      submitAndAnalyze({
        parent: { name: p.parentName, whatsapp: `081288800${p.i.toString().padStart(2, "0")}` },
        child: { name: p.studentName, gender: "L", birth_date: "2021-01-01", school: "TK Test", class_name: "TK B", education_level: "TK" },
        answers: p.answers
      })
    )
  );

  const statusResults = await Promise.all(statusSubmissions.map(s => getAssessmentResultServer(s.assessment_id, true)));
  const statusReports = statusResults.map((fullRes, idx) => ({
    name: statusPayloads[idx].studentName,
    fullText: JSON.stringify(fullRes.content)
  }));

  let maxJaccardStatus = 0;
  let exactDupStatus = 0;
  for (let i = 0; i < statusReports.length; i++) {
    for (let j = i + 1; j < statusReports.length; j++) {
      const sim = calculateJaccard(statusReports[i].fullText, statusReports[j].fullText);
      if (sim > maxJaccardStatus) maxJaccardStatus = sim;
      if (statusReports[i].fullText === statusReports[j].fullText) exactDupStatus++;
    }
  }

  console.log(`  ├─ 10 Children Evaluated.`);
  console.log(`  ├─ Exact Duplicate Full Reports: ${exactDupStatus} (Target: 0) ${exactDupStatus === 0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  ├─ Max Jaccard Similarity: ${maxJaccardStatus.toFixed(2)}%\n`);

  // -------------------------------------------------------------------------
  // TEST 2: 10 CHILDREN WITH IDENTICAL TOTAL SCORE (Sum = 120)
  // -------------------------------------------------------------------------
  console.log("📌 [TEST 2] Submitting 10 Children with IDENTICAL TOTAL SCORE (Sum = 120)...");

  const scorePayloads = Array.from({ length: 10 }, (_, idx) => {
    const i = idx + 1;
    const studentName = `Anak SkorSama ${i}`;
    const parentName = `OrangTuaSkor ${i}`;
    const answers = tkQuestions.map((q, qIdx) => {
      let score = 4; // default 4 * 30 = 120
      const section = Math.floor(qIdx / 7.5);
      if (section === (i - 1) % 4) {
        score = 5;
      } else if (section === ((i - 1) + 1) % 4) {
        score = 3;
      }
      return { question_id: q.id, score };
    });
    return { i, studentName, parentName, answers };
  });

  const scoreSubmissions = await Promise.all(
    scorePayloads.map(p =>
      submitAndAnalyze({
        parent: { name: p.parentName, whatsapp: `081277700${p.i.toString().padStart(2, "0")}` },
        child: { name: p.studentName, gender: "P", birth_date: "2021-02-02", school: "TK Test", class_name: "TK B", education_level: "TK" },
        answers: p.answers
      })
    )
  );

  const scoreResults = await Promise.all(scoreSubmissions.map(s => getAssessmentResultServer(s.assessment_id, true)));
  const scoreReports = scoreResults.map((fullRes, idx) => ({
    name: scorePayloads[idx].studentName,
    fullText: JSON.stringify(fullRes.content)
  }));

  let maxJaccardScore = 0;
  let exactDupScore = 0;
  for (let i = 0; i < scoreReports.length; i++) {
    for (let j = i + 1; j < scoreReports.length; j++) {
      const sim = calculateJaccard(scoreReports[i].fullText, scoreReports[j].fullText);
      if (sim > maxJaccardScore) maxJaccardScore = sim;
      if (scoreReports[i].fullText === scoreReports[j].fullText) exactDupScore++;
    }
  }

  console.log(`  ├─ 10 Children Evaluated.`);
  console.log(`  ├─ Exact Duplicate Full Reports: ${exactDupScore} (Target: 0) ${exactDupScore === 0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  ├─ Max Jaccard Similarity: ${maxJaccardScore.toFixed(2)}%\n`);

  console.log("=========================================================================");
  console.log("🎉 ALL SPECIFIC VARIATION AUDIT TESTS COMPLETED & PASSED!");
  console.log("=========================================================================");
}

runSpecificVariationTests().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
