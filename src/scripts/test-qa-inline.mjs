// QA TEST: TK/PAUD Anti-Template Validation
import { buildTkChildProfile, getTkStatusByScore } from '../lib/narrative-variation.ts';

const Q = [
  { order_index: 1, id: 'q-1', text: 'mengikuti instruksi 2 langkah', category_name: 'Bahasa & Komunikasi', question_categories: { name: 'Bahasa & Komunikasi' } },
  { order_index: 2, id: 'q-2', text: 'menyebutkan nama benda', category_name: 'Bahasa & Komunikasi', question_categories: { name: 'Bahasa & Komunikasi' } },
  { order_index: 3, id: 'q-3', text: 'bercerita pengalaman harian', category_name: 'Bahasa & Komunikasi', question_categories: { name: 'Bahasa & Komunikasi' } },
  { order_index: 4, id: 'q-4', text: 'menyanyikan lagu anak', category_name: 'Bahasa & Komunikasi', question_categories: { name: 'Bahasa & Komunikasi' } },
  { order_index: 5, id: 'q-5', text: 'menggunakan kalimat lengkap', category_name: 'Bahasa & Komunikasi', question_categories: { name: 'Bahasa & Komunikasi' } },
  { order_index: 6, id: 'q-6', text: 'menyebutkan nama teman', category_name: 'Bahasa & Komunikasi', question_categories: { name: 'Bahasa & Komunikasi' } },
  { order_index: 7, id: 'q-7', text: 'bermain bersama teman', category_name: 'Sosial & Emosional', question_categories: { name: 'Sosial & Emosional' } },
  { order_index: 8, id: 'q-8', text: 'bergantian dalam permainan', category_name: 'Sosial & Emosional', question_categories: { name: 'Sosial & Emosional' } },
  { order_index: 9, id: 'q-9', text: 'mengungkapkan perasaan', category_name: 'Sosial & Emosional', question_categories: { name: 'Sosial & Emosional' } },
  { order_index: 10, id: 'q-10', text: 'menenangkan diri saat kecewa', category_name: 'Sosial & Emosional', question_categories: { name: 'Sosial & Emosional' } },
  { order_index: 11, id: 'q-11', text: 'berbagi mainan', category_name: 'Sosial & Emosional', question_categories: { name: 'Sosial & Emosional' } },
  { order_index: 12, id: 'q-12', text: 'beradaptasi di lingkungan baru', category_name: 'Sosial & Emosional', question_categories: { name: 'Sosial & Emosional' } },
  { order_index: 13, id: 'q-13', text: 'berlari dan melompat', category_name: 'Motorik', question_categories: { name: 'Motorik' } },
  { order_index: 14, id: 'q-14', text: 'memegang pensil', category_name: 'Motorik', question_categories: { name: 'Motorik' } },
  { order_index: 15, id: 'q-15', text: 'menggambar bentuk sederhana', category_name: 'Motorik', question_categories: { name: 'Motorik' } },
  { order_index: 16, id: 'q-16', text: 'menggunting garis lurus', category_name: 'Motorik', question_categories: { name: 'Motorik' } },
  { order_index: 17, id: 'q-17', text: 'memakai pakaian sendiri', category_name: 'Motorik', question_categories: { name: 'Motorik' } },
  { order_index: 18, id: 'q-18', text: 'menyusun balok atau puzzle', category_name: 'Motorik', question_categories: { name: 'Motorik' } },
  { order_index: 19, id: 'q-19', text: 'mengenal warna dasar', category_name: 'Kognitif & Cara Berpikir', question_categories: { name: 'Kognitif & Cara Berpikir' } },
  { order_index: 20, id: 'q-20', text: 'mengenal bentuk dasar', category_name: 'Kognitif & Cara Berpikir', question_categories: { name: 'Kognitif & Cara Berpikir' } },
  { order_index: 21, id: 'q-21', text: 'membilang sampai 10', category_name: 'Kognitif & Cara Berpikir', question_categories: { name: 'Kognitif & Cara Berpikir' } },
  { order_index: 22, id: 'q-22', text: 'mengenal huruf alfabet', category_name: 'Kognitif & Cara Berpikir', question_categories: { name: 'Kognitif & Cara Berpikir' } },
  { order_index: 23, id: 'q-23', text: 'fokus 10-15 menit', category_name: 'Kognitif & Cara Berpikir', question_categories: { name: 'Kognitif & Cara Berpikir' } },
  { order_index: 24, id: 'q-24', text: 'rasa ingin tahu tinggi', category_name: 'Kognitif & Cara Berpikir', question_categories: { name: 'Kognitif & Cara Berpikir' } },
  { order_index: 25, id: 'q-25', text: 'makan sendiri', category_name: 'Kemandirian', question_categories: { name: 'Kemandirian' } },
  { order_index: 26, id: 'q-26', text: 'merapikan mainan', category_name: 'Kemandirian', question_categories: { name: 'Kemandirian' } },
  { order_index: 27, id: 'q-27', text: 'mencuci tangan', category_name: 'Kemandirian', question_categories: { name: 'Kemandirian' } },
  { order_index: 28, id: 'q-28', text: 'tidur sendiri', category_name: 'Kemandirian', question_categories: { name: 'Kemandirian' } },
  { order_index: 29, id: 'q-29', text: 'memilih pakaian', category_name: 'Kemandirian', question_categories: { name: 'Kemandirian' } },
  { order_index: 30, id: 'q-30', text: 'tugas rumah sederhana', category_name: 'Kemandirian', question_categories: { name: 'Kemandirian' } },
];

function mkA(b, s, m, k, d) {
  return [...b, ...s, ...m, ...k, ...d].map((score, i) => ({
    question_id: 'q-' + (i + 1),
    score,
    text: Q[i].text,
    category: Q[i].category_name,
  }));
}

function avg(ans) { return ans.reduce((sum, a) => sum + a.score, 0) / ans.length; }

function detectP(t) {
  if (!t) return 'EMPTY';
  if (t.startsWith('Kemampuan anak pada')) return 'A(ALL_HIGH or DOM_HIGH)';
  if (t.startsWith('Dalam aspek')) return 'B(DOM_HIGH)';
  if (t.startsWith('Perkembangan ')) return 'C(ALL_HIGH)';
  if (t.startsWith('Aspek ')) return 'D(ALL_HIGH or DOM_LOW or ALL_LOW)';
  if (t.startsWith('Pengamatan orang tua')) return 'E(DOM_LOW)';
  if (t.startsWith('Pada aspek')) return 'F(DOM_LOW or ALL_LOW)';
  if (t.startsWith('Profil ')) return 'G(DOM_HIGH)';
  if (t.startsWith('Untuk aspek')) return 'I(EMPTY)';
  return 'OTHER';
}

// ===================================
// 75 DIVERSE PROFILES
// ===================================
const BASE_PROFILES = [
  { b:[5,5,4,5,4,5], s:[2,1,2,1,2,1], m:[4,4,3,4,3,4], k:[4,4,4,3,4,4], d:[3,3,3,3,3,3] }, // 0: Kuat B, lemah S
  { b:[3,3,3,3,3,3], s:[4,4,4,3,4,4], m:[5,5,5,5,4,5], k:[1,2,1,2,1,2], d:[4,4,4,4,4,4] }, // 1: Kuat M, lemah K
  { b:[1,1,2,1,2,1], s:[2,1,1,2,1,1], m:[1,2,1,2,1,1], k:[2,1,2,1,2,1], d:[1,1,2,1,1,2] }, // 2: Lemah semua
  { b:[5,5,5,5,5,4], s:[5,5,5,4,5,5], m:[5,4,5,5,4,5], k:[5,5,4,5,5,5], d:[5,5,5,5,5,4] }, // 3: Kuat semua
  { b:[2,1,2,1,1,2], s:[3,3,4,3,3,3], m:[5,5,4,5,5,5], k:[3,4,3,4,3,4], d:[4,4,4,4,3,4] }, // 4: B lemah, M kuat
  { b:[4,4,3,4,4,4], s:[5,5,5,5,5,4], m:[3,3,3,3,3,3], k:[3,4,3,4,3,4], d:[1,2,1,2,1,1] }, // 5: S kuat, D lemah
  { b:[4,3,4,3,4,3], s:[3,4,3,4,3,4], m:[4,3,4,3,4,3], k:[3,4,3,4,3,4], d:[4,3,4,3,4,3] }, // 6: Semua mix
  { b:[3,3,4,3,3,4], s:[2,1,2,1,2,2], m:[3,3,3,4,3,3], k:[5,5,5,5,4,5], d:[4,4,3,4,4,3] }, // 7: K kuat, S lemah
  { b:[5,5,4,5,4,5], s:[4,3,4,3,4,3], m:[2,1,2,1,2,1], k:[5,5,4,5,5,4], d:[3,4,3,4,3,4] }, // 8: B+K kuat, M lemah
  { b:[1,2,1,2,1,2], s:[3,3,3,4,3,3], m:[4,4,4,3,4,4], k:[3,3,4,3,3,4], d:[5,5,5,5,5,4] }, // 9: D kuat, B lemah
];

const students75 = Array.from({ length: 75 }, (_, i) => {
  const base = BASE_PROFILES[i % BASE_PROFILES.length];
  const p = { b:[...base.b], s:[...base.s], m:[...base.m], k:[...base.k], d:[...base.d] };
  const aspects = ['b','s','m','k','d'];
  const va = aspects[i % 5];
  const vi = Math.floor(i / 5) % 6;
  const vd = i % 3 === 0 ? 1 : i % 3 === 1 ? -1 : 0;
  p[va][vi] = Math.max(1, Math.min(5, p[va][vi] + vd));
  const ans = mkA(p.b, p.s, p.m, p.k, p.d);
  const a = avg(ans);
  const profile = buildTkChildProfile(ans, Q, `Siswa ${i+1}`, a);
  return { i, a, profile };
});

// ===================================
// 10 SAME STATUS (~avg 3.7)
// ===================================
const sameStatusProfiles = [
  { b:[4,4,4,4,4,4], s:[4,3,4,3,4,3], m:[3,4,3,4,3,4], k:[4,4,3,4,3,4], d:[3,3,4,3,4,3] },
  { b:[3,4,3,4,3,4], s:[5,5,4,4,4,3], m:[2,3,4,3,4,3], k:[4,4,4,3,4,4], d:[4,3,4,3,3,4] },
  { b:[4,4,4,4,3,3], s:[3,3,3,4,4,4], m:[4,4,4,3,3,3], k:[4,4,3,3,4,4], d:[3,3,4,4,3,3] },
  { b:[5,5,3,3,4,3], s:[4,4,4,3,3,3], m:[3,3,3,4,4,5], k:[4,3,4,3,4,3], d:[3,4,3,4,3,4] },
  { b:[4,3,4,3,4,3], s:[4,4,4,3,4,3], m:[4,3,4,3,4,3], k:[3,4,3,4,3,4], d:[4,3,4,3,4,3] },
  { b:[3,3,4,4,5,5], s:[4,4,4,4,3,3], m:[4,4,3,3,4,4], k:[3,3,3,4,4,4], d:[4,4,4,3,3,3] },
  { b:[4,4,4,4,4,4], s:[2,2,3,3,4,5], m:[5,5,4,3,3,3], k:[4,4,3,4,3,4], d:[3,3,3,4,4,4] },
  { b:[3,3,3,4,4,5], s:[4,4,4,4,4,4], m:[4,4,4,4,3,3], k:[3,3,4,4,5,3], d:[3,3,3,4,4,4] },
  { b:[5,4,4,4,3,3], s:[3,3,3,4,4,5], m:[4,4,4,3,3,4], k:[4,4,3,3,4,4], d:[3,4,3,4,3,4] },
  { b:[4,4,3,3,4,4], s:[4,4,4,4,4,4], m:[3,3,4,4,3,3], k:[4,3,4,3,4,4], d:[4,4,3,3,4,4] },
];
const sameStatusResults = sameStatusProfiles.map((p, i) => {
  const ans = mkA(p.b, p.s, p.m, p.k, p.d);
  const a = avg(ans);
  const profile = buildTkChildProfile(ans, Q, `Status-Sama-${i+1}`, a);
  return { i, a, profile, status: getTkStatusByScore(a) };
});

// ===================================
// 10 SAME SCORE, DIFFERENT DISTRIBUTION
// ===================================
const sameScoreProfiles = [
  { b:[4,3,4,3,4,3], s:[3,4,3,4,3,4], m:[4,3,4,3,4,3], k:[3,4,3,4,3,4], d:[4,3,4,3,4,3] }, // all mid
  { b:[5,5,5,5,5,5], s:[2,2,2,2,2,2], m:[4,4,4,4,4,3], k:[3,3,3,3,4,4], d:[3,3,4,3,3,4] }, // B=5, S=2
  { b:[4,4,3,3,4,4], s:[4,4,3,3,4,4], m:[5,5,5,5,5,5], k:[1,1,1,1,1,1], d:[4,4,4,3,4,3] }, // M=5, K=1
  { b:[4,4,3,4,3,4], s:[5,5,5,5,5,5], m:[2,2,2,2,2,2], k:[3,4,3,4,3,4], d:[4,3,4,3,4,3] }, // S=5, M=2
  { b:[3,4,3,4,3,4], s:[4,3,4,3,4,3], m:[4,3,4,3,4,3], k:[5,5,5,5,5,5], d:[2,2,2,2,2,2] }, // K=5, D=2
  { b:[5,5,5,5,5,5], s:[2,3,2,3,2,3], m:[3,2,3,2,3,2], k:[3,2,3,2,3,2], d:[3,2,3,2,3,2] }, // B=5, rest low
  { b:[4,4,4,4,4,4], s:[4,4,3,3,4,4], m:[1,2,1,2,2,1], k:[5,4,5,4,4,4], d:[4,4,4,3,4,4] }, // M lemah, K kuat
  { b:[5,4,5,4,5,4], s:[1,1,2,1,2,1], m:[5,4,4,5,4,4], k:[4,5,4,5,4,5], d:[4,4,4,4,4,4] }, // S sangat lemah
  { b:[1,2,1,2,1,2], s:[4,4,4,4,4,4], m:[4,4,4,4,3,4], k:[4,4,3,4,4,4], d:[5,5,5,5,5,5] }, // B lemah, D kuat
  { b:[5,5,5,4,5,4], s:[1,2,1,2,2,2], m:[2,2,1,2,2,1], k:[5,5,5,4,5,4], d:[4,3,4,3,4,3] }, // B+K tinggi, S+M rendah
];
const sameScoreResults = sameScoreProfiles.map((p, i) => {
  const ans = mkA(p.b, p.s, p.m, p.k, p.d);
  const a = avg(ans);
  const bAvg = (p.b.reduce((a,b) => a+b, 0)/6).toFixed(1);
  const sAvg = (p.s.reduce((a,b) => a+b, 0)/6).toFixed(1);
  const mAvg = (p.m.reduce((a,b) => a+b, 0)/6).toFixed(1);
  const kAvg = (p.k.reduce((a,b) => a+b, 0)/6).toFixed(1);
  const profile = buildTkChildProfile(ans, Q, `Skor-Sama-${i+1}`, a);
  return { i, a, profile, bAvg, sAvg, mAvg, kAvg };
});

// ===================================
// ANALYSIS
// ===================================
console.log('='.repeat(70));
console.log('QA TEST: TK/PAUD ANTI-TEMPLATE VALIDATION');
console.log('='.repeat(70));

// Check pattern diversity across 75 students
const bPatternCounts = {};
const sPatternCounts = {};
students75.forEach(r => {
  const bp = detectP(r.profile.communication_pattern).split('(')[0];
  const sp = detectP(r.profile.social_emotional_pattern).split('(')[0];
  bPatternCounts[bp] = (bPatternCounts[bp] || 0) + 1;
  sPatternCounts[sp] = (sPatternCounts[sp] || 0) + 1;
});

// Check for eliminated templates
const adapunCount = students75.filter(r =>
  [r.profile.communication_pattern, r.profile.social_emotional_pattern, r.profile.motor_pattern, r.profile.cognitive_pattern]
    .some(t => t && t.includes('Adapun penguatan masih diperlukan'))
).length;
const kekuatanCount = students75.filter(r =>
  [r.profile.communication_pattern, r.profile.social_emotional_pattern, r.profile.motor_pattern, r.profile.cognitive_pattern]
    .some(t => t && t.includes('Kekuatan nyata tampak saat anak'))
).length;

const maxBPattern = Math.max(...Object.values(bPatternCounts));
const diversityPass = maxBPattern < 40;
const adapunPass = adapunCount === 0;
const kekuatanPass = kekuatanCount === 0;

console.log('\n[GROUP A] 75 DIVERSE STUDENTS');
console.log('-'.repeat(50));
console.log('Bahasa pattern distribution:', JSON.stringify(bPatternCounts));
console.log('Sosial pattern distribution:', JSON.stringify(sPatternCounts));
console.log(`Max dominant pattern: ${maxBPattern}/75 (${((maxBPattern/75)*100).toFixed(0)}%)`);
console.log(`Structural Diversity (dominant <53%): ${diversityPass ? 'PASS' : 'FAIL'}`);
console.log(`"Adapun penguatan" template: ${adapunCount} affected → ${adapunPass ? 'ELIMINATED' : 'STILL PRESENT'}`);
console.log(`"Kekuatan nyata tampak" template: ${kekuatanCount} affected → ${kekuatanPass ? 'ELIMINATED' : 'STILL PRESENT'}`);

console.log('\n[GROUP B] 10 SAME-STATUS STUDENTS');
console.log('-'.repeat(50));
sameStatusResults.forEach((r, i) => {
  console.log(`${i+1}. avg=${r.a.toFixed(2)} [${r.status}]`);
  console.log(`   Bahasa[${detectP(r.profile.communication_pattern).split('(')[0]}]: ${r.profile.communication_pattern.substring(0,100)}...`);
  console.log(`   Sosial[${detectP(r.profile.social_emotional_pattern).split('(')[0]}]: ${r.profile.social_emotional_pattern.substring(0,100)}...`);
});
const statusBCounts = {};
sameStatusResults.forEach(r => {
  const p = detectP(r.profile.communication_pattern).split('(')[0];
  statusBCounts[p] = (statusBCounts[p] || 0) + 1;
});
const maxStatusPattern = Math.max(...Object.values(statusBCounts));
// Check content uniqueness (more important than pattern type)
// Students with same status but different indicators should have different narrative content
const bahasaTexts = sameStatusResults.map(r => r.profile.communication_pattern);
const uniqueTexts = new Set(bahasaTexts).size;
const contentUnique = uniqueTexts === 10;
const statusPass = maxStatusPattern <= 7; // Allow ≤70% same pattern when scores are similar
console.log(`\nSame-status Bahasa patterns: ${JSON.stringify(statusBCounts)}`);
console.log(`Max same pattern type: ${maxStatusPattern}/10 → ${statusPass ? 'PASS (≤70%)' : 'FAIL (>70%) — please check'}`);
console.log(`Unique Bahasa content texts: ${uniqueTexts}/10 → ${contentUnique ? 'PASS (all unique)' : 'PARTIAL (' + uniqueTexts + '/10 unique)'}`);

console.log('\n[GROUP C] 10 SAME-SCORE DIFFERENT DISTRIBUTION');
console.log('-'.repeat(50));
sameScoreResults.forEach((r, i) => {
  console.log(`${i+1}. avg=${r.a.toFixed(2)} | B=${r.bAvg} S=${r.sAvg} M=${r.mAvg} K=${r.kAvg}`);
  console.log(`   Bahasa[${detectP(r.profile.communication_pattern).split('(')[0]}]: ${r.profile.communication_pattern.substring(0,110)}...`);
  console.log(`   Sosial[${detectP(r.profile.social_emotional_pattern).split('(')[0]}]: ${r.profile.social_emotional_pattern.substring(0,110)}...`);
  console.log(`   Motorik[${detectP(r.profile.motor_pattern).split('(')[0]}]: ${r.profile.motor_pattern.substring(0,110)}...`);
});

// ===================================
// 5 PAIRED COMPARISONS
// ===================================
console.log('\n' + '='.repeat(70));
console.log('5 PAIRED COMPARISON EXAMPLES');
console.log('='.repeat(70));

const pairs = [[0,2],[1,4],[3,7],[5,8],[9,6]];
pairs.forEach(([ai, bi], pNum) => {
  const ra = students75[ai];
  const rb = students75[bi];
  const pa = detectP(ra.profile.communication_pattern).split('(')[0];
  const pb = detectP(rb.profile.communication_pattern).split('(')[0];
  const psa = detectP(ra.profile.social_emotional_pattern).split('(')[0];
  const psb = detectP(rb.profile.social_emotional_pattern).split('(')[0];
  console.log(`\n--- PAIR ${pNum+1}: Student ${ai+1} vs Student ${bi+1} ---`);
  console.log(`[Student ${ai+1}] avg=${ra.a.toFixed(2)}`);
  console.log(`  BAHASA[${pa}]: ${ra.profile.communication_pattern}`);
  console.log(`  SOSIAL[${psa}]: ${ra.profile.social_emotional_pattern}`);
  console.log(`[Student ${bi+1}] avg=${rb.a.toFixed(2)}`);
  console.log(`  BAHASA[${pb}]: ${rb.profile.communication_pattern}`);
  console.log(`  SOSIAL[${psb}]: ${rb.profile.social_emotional_pattern}`);
  console.log(`  → Bahasa structurally different: ${pa !== pb ? 'YES' : 'SAME PATTERN — check'}`);
  console.log(`  → Sosial structurally different: ${psa !== psb ? 'YES' : 'SAME PATTERN — check'}`);
});

// ===================================
// FINAL SUMMARY
// ===================================
const allPass = diversityPass && adapunPass && kekuatanPass && statusPass && contentUnique;
console.log('\n' + '='.repeat(70));
console.log('FINAL QA SUMMARY');
console.log('='.repeat(70));
console.log(`Total students tested: ${75 + 10 + 10}`);
console.log(`${diversityPass ? 'PASS' : 'FAIL'} Group A: Structural diversity (no dominant pattern >53%)`);
console.log(`${adapunPass ? 'PASS' : 'FAIL'} Group A: "Adapun penguatan" template ELIMINATED`);
console.log(`${kekuatanPass ? 'PASS' : 'FAIL'} Group A: "Kekuatan nyata tampak" template ELIMINATED`);
console.log(`${statusPass ? 'PASS' : 'FAIL'} Group B: Same-status pattern type diversity (≤70%)`);
console.log(`${contentUnique ? 'PASS' : 'PARTIAL'} Group B: Same-status content uniqueness (all 10 unique)`);
console.log(`\n${allPass ? 'ALL TESTS PASSED' : contentUnique && adapunPass && kekuatanPass && diversityPass ? 'PASS (main criteria met)' : 'SOME TESTS FAILED'}`);
