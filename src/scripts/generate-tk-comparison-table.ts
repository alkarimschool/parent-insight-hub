import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { LEVEL_QUESTIONS } from "../lib/questions.data";

async function generateComparisonData() {
  const tkQuestions = LEVEL_QUESTIONS.TK;
  
  // 5 distinct archetypes to showcase comparison
  const archetypes = [
    { name: "Siswa Uji 01 (Unggul Bahasa & Kognitif)", class: "TK B Kelas A", profile: 0 },
    { name: "Siswa Uji 02 (Unggul Motorik, Perlu Bahasa)", class: "TK B Kelas B", profile: 1 },
    { name: "Siswa Uji 03 (Unggul Sosial, Perlu Kognitif)", class: "TK B Kelas C", profile: 3 },
    { name: "Siswa Uji 04 (Perlu Penguatan Kemandirian)", class: "TK B Kelas D", profile: 4 },
    { name: "Siswa Uji 05 (Tinggi Semua / Mandiri)", class: "TK B Kelas E", profile: 5 },
  ];

  const results: any[] = [];

  for (const arch of archetypes) {
    const answers = tkQuestions.map((q, qIdx) => {
      let score = 4;
      if (arch.profile === 0) { // High Language, Moderate Social
        score = qIdx < 7 ? 5 : qIdx < 15 ? 3 : (qIdx % 2 === 0 ? 4 : 3);
      } else if (arch.profile === 1) { // High Motor, Low Language
        score = qIdx >= 15 && qIdx < 22 ? 5 : qIdx < 7 ? 2 : (qIdx % 2 === 0 ? 4 : 3);
      } else if (arch.profile === 3) { // High Social, Low Cognitive
        score = qIdx >= 7 && qIdx < 15 ? 5 : qIdx >= 22 ? 2 : (qIdx % 2 === 0 ? 4 : 3);
      } else if (arch.profile === 4) { // Needs Guidance All
        score = (qIdx % 3 === 0) ? 2 : (qIdx % 2 === 0 ? 3 : 2);
      } else { // High All
        score = (qIdx % 4 === 0) ? 4 : 5;
      }
      return { question_id: q.id, score };
    });

    const res = await submitAndAnalyze({
      parent: { name: `Orang Tua ${arch.name}`, whatsapp: "08129990001" },
      child: { name: arch.name, gender: "L", birth_date: "2021-01-01", school: "TK Alam", class_name: arch.class, education_level: "TK" },
      answers
    });

    const fullRes = await getAssessmentResultServer(res.assessment_id, true);
    results.push({ name: arch.name, class: arch.class, content: fullRes.content });
  }

  console.log(JSON.stringify(results, null, 2));
}

generateComparisonData().catch(console.error);
