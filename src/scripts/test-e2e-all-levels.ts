import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { LEVEL_QUESTIONS, EducationLevel } from "../lib/questions.data";

async function runE2ETestAllLevels() {
  console.log("==========================================================================");
  console.log("🧪 RUNNING END-TO-END AI ANALYSIS TEST FOR ALL 4 EDUCATION LEVELS");
  console.log("==========================================================================\n");

  const testCases: Array<{
    level: EducationLevel;
    parentName: string;
    parentWa: string;
    childName: string;
    childGender: "L" | "P";
    school: string;
    className: string;
  }> = [
    {
      level: "TK",
      parentName: "Ibu Nurul",
      parentWa: "081234567891",
      childName: "Rayyan",
      childGender: "L",
      school: "TK Al-Karim",
      className: "TK B",
    },
    {
      level: "SD",
      parentName: "Bapak Hendra",
      parentWa: "081298765432",
      childName: "Budi Pratama",
      childGender: "L",
      school: "SD Negeri 01",
      className: "Kelas 4",
    },
    {
      level: "SMP",
      parentName: "Ibu Rahma",
      parentWa: "081311223344",
      childName: "Siti Azzahra",
      childGender: "P",
      school: "SMP Islam Terpadu",
      className: "Kelas 8",
    },
    {
      level: "SMA",
      parentName: "Bapak Agus",
      parentWa: "081555667788",
      childName: "Andi Wijaya",
      childGender: "L",
      school: "SMA Negeri 3",
      className: "Kelas 11 IPA",
    },
  ];

  const resultsMap: Record<string, any> = {};

  for (const tc of testCases) {
    console.log(`\n▶ [START TEST] Processing Assessment for Jenjang: ${tc.level}`);
    console.log(`  - Child Name : ${tc.childName}`);
    console.log(`  - Parent     : ${tc.parentName} (${tc.parentWa})`);
    console.log(`  - School     : ${tc.school} - ${tc.className}`);

    const questions = LEVEL_QUESTIONS[tc.level];
    const answers = questions.map((q) => {
      if (q.type === "textarea") {
        return {
          question_id: q.id,
          text_answer: q.id.includes("q14")
            ? `Anak sangat menonjol di bidang ${tc.level === "TK" ? "mewarnai dan bercerita" : tc.level === "SD" ? "matematika dan menggambar" : tc.level === "SMP" ? "organisasi dan sains" : "public speaking dan pemrograman"}.`
            : `Perlu lebih banyak pendampingan dalam ${tc.level === "TK" ? "merapikan mainan" : tc.level === "SD" ? "konsentrasi saat belajar" : tc.level === "SMP" ? "manajemen waktu gadget" : "persiapan ujian tertulis"}.`,
        };
      } else if (q.options && q.options.length > 0) {
        return {
          question_id: q.id,
          score: q.options[0].v,
          text_answer: q.options[0].label,
        };
      } else {
        return {
          question_id: q.id,
          score: 4,
          text_answer: "Sering",
        };
      }
    });

    try {
      const submitRes = await submitAndAnalyze({
        parent: {
          name: tc.parentName,
          whatsapp: tc.parentWa,
        },
        child: {
          name: tc.childName,
          gender: tc.childGender,
          birth_date: "2015-01-01",
          school: tc.school,
          class_name: tc.className,
          education_level: tc.level,
        },
        answers,
      });

      console.log(`  ✓ Assessment Saved (ID: ${submitRes.assessment_id})`);
      const reportData = await getAssessmentResultServer(submitRes.assessment_id);
      const analysisContent = reportData?.content;
      console.log(`  📋 OUTPUT CONTENT FOR ${tc.level}:`);
      console.log(JSON.stringify(analysisContent, null, 2));
      resultsMap[tc.level] = {
        level: tc.level,
        childName: tc.childName,
        assessmentId: submitRes.assessment_id,
        analysisContent,
      };
    } catch (err: any) {
      console.error(`  ❌ Error processing ${tc.level}:`, err);
    }
  }

  console.log("\n==========================================================================");
  console.log("📊 FULL OUTPUT SUMMARY FOR ALL 4 EDUCATION LEVELS:");
  console.log("==========================================================================");
  console.log(JSON.stringify(resultsMap, null, 2));
}

runE2ETestAllLevels().catch(console.error);
