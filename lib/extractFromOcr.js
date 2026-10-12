const STOP_WORDS =
  /\b(directions?|how to use|warnings?|caution|manufactured|marketed|mfd|mfg|net (?:wt|weight|content)|storage|store in|best before|expiry|use by|nutrition(?:al)? (?:information|facts)|customer care|batch|made in|barcode)\b/i;

export function extractIngredientsFromText(rawText) {
  const text = String(rawText || "").replace(/\r/g, "\n");
  const startMatch = text.match(/(ingredients?|ingr[e\u00e9]dients|composition)\s*[:\-]/i);

  if (!startMatch) {
    return { found: false, text: "", reason: "no_heading" };
  }

  let body = text.slice(startMatch.index + startMatch[0].length);
  const stop = body.search(STOP_WORDS);
  if (stop > 20) {
    body = body.slice(0, stop);
  }
  body = body.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();

  const commaCount = (body.match(/,/g) || []).length;
  if (body.length < 8 || commaCount < 1) {
    return { found: false, text: body, reason: "too_short" };
  }

  return { found: true, text: body, reason: "ok" };
}
