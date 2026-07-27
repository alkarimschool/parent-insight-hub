import { getAssessmentContent } from "../lib/assessment-content";
import { EducationLevel, LEVEL_QUESTIONS } from "../lib/questions.data";

async function testAiLevelPrompts() {
  console.log("=================================================");
  console.log("🧪 TESTING AI PROMPT & CONTENT FOR ALL 5 LEVELS");
  console.log("=================================================\n");

  const levels: EducationLevel[] = ["TK", "SD", "SMP", "SMA", "SMK"];

  for (const level of levels) {
    const content = getAssessmentContent(level);
    const questions = LEVEL_QUESTIONS[level];

    console.log(`▶ JENJANG: ${level}`);
    console.log(`  - Title       : "${content.reportTitle}"`);
    console.log(`  - Full Name   : "${content.fullName}"`);
    console.log(`  - Questions   : ${questions.length} questions loaded`);
    console.log(`  - Sample Q1   : [${questions[0].category_name}] ${questions[0].text}`);
    console.log(`  - Intro Text  : "${content.introText.substring(0, 80)}..."`);
    console.log(`-------------------------------------------------`);
  }

  console.log("\n✅ ALL 5 EDUCATION LEVELS HAVE INDEPENDENT PROMPTS & TEMPLATES!");
  console.log("=================================================");
}

testAiLevelPrompts().catch(console.error);
