const STOPWORDS = new Set(
  "the a an and or but of to in on for with at by from as is are was were be been being this that these those it its his her their our your my have has had will would can could should just now new latest breaking update news".split(
    " ",
  ),
);

export function significantTokens(text) {
  if (!text || typeof text !== "string") return [];
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export function similarity(a, b) {
  const setA = new Set(significantTokens(a));
  const setB = new Set(significantTokens(b));
  if (setA.size < 3 || setB.size < 3) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  if (intersection === 0) return 0;

  const union = setA.size + setB.size - intersection;
  const jaccard = intersection / union;
  const containment = intersection / Math.min(setA.size, setB.size);

  return Math.max(jaccard, containment * 0.92);
}
