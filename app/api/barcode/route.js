import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DATABASES = [
  { host: "world.openfoodfacts.org", name: "Open Food Facts", category: "food" },
  { host: "world.openbeautyfacts.org", name: "Open Beauty Facts", category: "skincare" },
  { host: "world.openproductsfacts.org", name: "Open Products Facts", category: "cleaning" },
];

async function lookup(db, code) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url =
      "https://" + db.host + "/api/v2/product/" + code + ".json?fields=product_name,brands,ingredients_text";
    const response = await fetch(url, {
      headers: { "User-Agent": "ChemCheck-CollegeProject/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false };
    const data = await response.json();
    if (data.status !== 1 || !data.product) return { ok: true, found: false };
    return { ok: true, found: true, product: data.product };
  } catch (error) {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request) {
  const code = new URL(request.url).searchParams.get("code") || "";
  if (!/^\d{8,14}$/.test(code)) {
    return NextResponse.json({ error: "A barcode has 8 to 14 digits." }, { status: 400 });
  }

  let reachable = 0;
  for (const db of DATABASES) {
    const result = await lookup(db, code);
    if (result.ok) reachable += 1;
    if (result.found) {
      const p = result.product;
      return NextResponse.json({
        found: true,
        database: db.name,
        suggestedCategory: db.category,
        productName: p.product_name || "",
        brand: p.brands || "",
        ingredients: (p.ingredients_text || "").trim(),
        note: "This data is contributed by volunteers. Compare it with the printed label before relying on it.",
      });
    }
  }

  if (reachable === 0) {
    return NextResponse.json(
      { error: "The barcode databases could not be reached. Check your internet connection and try again." },
      { status: 502 }
    );
  }
  return NextResponse.json({ found: false });
}
