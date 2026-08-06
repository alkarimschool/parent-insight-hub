// Utilitas perhitungan kemiripan teks (bigram Jaccard, 0-100%).
function normalize(text: string): string[] {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function bigrams(words: string[]): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) set.add(`${words[i]}_${words[i + 1]}`);
  return set;
}

/** Kemiripan dua teks dalam persen (0-100). */
export function textSimilarity(a: string, b: string): number {
  const wa = normalize(a);
  const wb = normalize(b);
  if (wa.length === 0 || wb.length === 0) return 0;

  const ba = bigrams(wa);
  const bb = bigrams(wb);
  if (ba.size === 0 || bb.size === 0) {
    const sa = new Set(wa);
    const sb = new Set(wb);
    let inter = 0;
    sa.forEach((w) => sb.has(w) && inter++);
    return (inter / Math.max(sa.size, sb.size)) * 100;
  }

  let inter = 0;
  ba.forEach((g) => bb.has(g) && inter++);
  const union = new Set([...ba, ...bb]).size;
  return (inter / union) * 100;
}

export interface PairwiseStats {
  avg: number;
  max: number;
  min: number;
  worstPair: [number, number];
}

/** Statistik kemiripan seluruh pasangan teks. */
export function pairwiseSimilarity(texts: string[]): PairwiseStats {
  let total = 0;
  let pairs = 0;
  let max = 0;
  let min = 100;
  let worstPair: [number, number] = [0, 0];

  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const sim = textSimilarity(texts[i]!, texts[j]!);
      total += sim;
      pairs++;
      if (sim > max) {
        max = sim;
        worstPair = [i, j];
      }
      if (sim < min) min = sim;
    }
  }

  return { avg: pairs ? total / pairs : 0, max, min: pairs ? min : 0, worstPair };
}