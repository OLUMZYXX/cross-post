const STYLES = {
  bold: { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce, exceptions: {} },
  italic: { upper: 0x1d434, lower: 0x1d44e, digit: null, exceptions: { h: 0x210e } },
  boldItalic: { upper: 0x1d468, lower: 0x1d482, digit: null, exceptions: {} },
  script: { upper: 0x1d4d0, lower: 0x1d4ea, digit: null, exceptions: {} },
  monospace: { upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6, exceptions: {} },
  sansBold: { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec, exceptions: {} },
  doubleStruck: {
    upper: 0x1d538,
    lower: 0x1d552,
    digit: 0x1d7d8,
    exceptions: {
      C: 0x2102,
      H: 0x210d,
      N: 0x2115,
      P: 0x2119,
      Q: 0x211a,
      R: 0x211d,
      Z: 0x2124,
    },
  },
};

const PREVIEWS = {
  plain: "Aa",
  bold: "𝐀𝐚",
  italic: "𝐴𝑎",
  boldItalic: "𝑨𝒂",
  script: "𝓐𝓪",
  monospace: "𝙰𝚊",
  sansBold: "𝗔𝗮",
  doubleStruck: "𝔸𝕒",
};

const LABELS = {
  plain: "Plain",
  bold: "Bold",
  italic: "Italic",
  boldItalic: "Bold Italic",
  script: "Script",
  monospace: "Mono",
  sansBold: "Sans Bold",
  doubleStruck: "Outline",
};

export const FONT_OPTIONS = Object.keys(PREVIEWS).map((key) => ({
  key,
  preview: PREVIEWS[key],
  label: LABELS[key],
}));

function styleChar(ch, style) {
  if (style.exceptions[ch] != null) {
    return String.fromCodePoint(style.exceptions[ch]);
  }
  const code = ch.charCodeAt(0);
  if (style.upper != null && code >= 65 && code <= 90) {
    return String.fromCodePoint(style.upper + (code - 65));
  }
  if (style.lower != null && code >= 97 && code <= 122) {
    return String.fromCodePoint(style.lower + (code - 97));
  }
  if (style.digit != null && code >= 48 && code <= 57) {
    return String.fromCodePoint(style.digit + (code - 48));
  }
  return ch;
}

function shouldSkipToken(token) {
  if (!token) return true;
  if (token.startsWith("#") || token.startsWith("@")) return true;
  if (/^https?:\/\//i.test(token)) return true;
  return false;
}

function plainChar(ch) {
  const code = ch.codePointAt(0);
  for (const key of Object.keys(STYLES)) {
    const s = STYLES[key];
    if (s.upper != null && code >= s.upper && code < s.upper + 26) {
      return String.fromCharCode(65 + (code - s.upper));
    }
    if (s.lower != null && code >= s.lower && code < s.lower + 26) {
      return String.fromCharCode(97 + (code - s.lower));
    }
    if (s.digit != null && code >= s.digit && code < s.digit + 10) {
      return String.fromCharCode(48 + (code - s.digit));
    }
    for (const plain in s.exceptions) {
      if (code === s.exceptions[plain]) return plain;
    }
  }
  return ch;
}

export function toPlain(text) {
  if (!text) return text;
  let out = "";
  for (const ch of text) out += plainChar(ch);
  return out;
}

function styleToken(token, style) {
  if (shouldSkipToken(token)) return token;
  let out = "";
  for (const ch of token) out += styleChar(ch, style);
  return out;
}

export function applyFont(text, key) {
  if (!text) return text;
  const plain = toPlain(text);
  if (key === "plain" || !STYLES[key]) return plain;
  const style = STYLES[key];
  return plain
    .split(/(\s+)/)
    .map((tok) => (/^\s+$/.test(tok) ? tok : styleToken(tok, style)))
    .join("");
}
