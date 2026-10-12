export function normalize(text) {
  let t = String(text || "").toLowerCase();
  t = t.replace(/\d+(\.\d+)?\s*%/g, " ");
  t = t.replace(/sulphate/g, "sulfate");
  t = t.replace(/&/g, " ");
  t = t.replace(/[^a-z0-9\s]/g, " ");
  t = t.replace(/\b(?:ins|e)\s?(\d{3,4}[a-z]{0,2})\b/g, "ins$1");
  t = t.replace(/\s+/g, " ").trim();
  if (/^\d{3,4}[a-z]{0,2}$/.test(t)) {
    t = "ins" + t;
  }
  return t;
}

function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(" || ch === "[") {
      depth += 1;
    } else if (ch === ")" || ch === "]") {
      depth = Math.max(0, depth - 1);
    }
    if (depth === 0 && /[,;\n\u2022\u00b7|]/.test(ch)) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts
    .map((s) => s.replace(/\s+/g, " ").trim().replace(/[.\s]+$/, ""))
    .filter(Boolean);
}

function expandToken(token) {
  const m = token.match(/^(.*?)\s*[\(\[](.*)[\)\]]\s*$/);
  if (!m) {
    return [{ raw: token, candidates: [token] }];
  }
  const main = m[1].trim();
  const inner = m[2].trim();
  const innerParts = splitTopLevel(inner);

  if (innerParts.length > 1) {
    const result = [];
    if (main) {
      result.push({ raw: main, candidates: [main] });
    }
    innerParts.forEach((p) => {
      expandToken(p).forEach((item) => result.push(item));
    });
    return result;
  }

  const candidates = [token];
  if (main) candidates.push(main);
  if (inner) candidates.push(inner);
  return [{ raw: token, candidates }];
}

export function parseIngredientList(raw) {
  if (!raw || typeof raw !== "string") return [];

  let text = raw.replace(/\r/g, "\n");
  text = text.replace(/ingredients?\s*[:\-]/gi, " ");
  text = text.replace(/\bcontains?\s*:/gi, " ");

  const tokens = splitTopLevel(text);
  const items = [];
  const seen = new Set();

  tokens.forEach((rawToken) => {
    const token = rawToken.replace(/\s*\d+(\.\d+)?\s*%\s*$/, "").trim();
    if (!token) return;
    expandToken(token).forEach((item) => {
      const key = normalize(item.raw);
      if (!key || key.length < 2 || seen.has(key)) return;
      seen.add(key);
      items.push(item);
    });
  });

  return items;
}
