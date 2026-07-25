const SENTENCE_END = /[.!?]["')\]]?(?:\s|$)/g;

export function lastSentenceEnd(text) {
  let end = -1;
  SENTENCE_END.lastIndex = 0;
  let match;
  while ((match = SENTENCE_END.exec(text)) !== null) {
    end = match.index + match[0].trimEnd().length;
  }
  return end;
}

const TRAILING_DECOR =
  /[\s\p{Extended_Pictographic}‍️⃣#*\d]+$/u;

export function endsWithSentence(text) {
  const stripped = (text || "").trim().replace(TRAILING_DECOR, "");
  return /[.!?]["')\]]?$/.test(stripped);
}

export function fitToCompleteSentence(text, limit) {
  const clean = (text || "").trim();
  if (!limit || limit <= 0) return clean;
  if (clean.length <= limit && endsWithSentence(clean)) return clean;

  const window = clean.length <= limit ? clean : clean.slice(0, limit);
  const end = lastSentenceEnd(window);
  if (end > limit * 0.45) return window.slice(0, end).trim();

  if (clean.length <= limit) return clean;

  let cut = clean.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > limit * 0.5) cut = cut.slice(0, lastSpace);
  return `${cut.replace(/[,;:\-—\s]+$/, "")}.`;
}
