import { NextResponse } from "next/server";
import { analyzeIngredients } from "@/lib/analyzer";
import { summarizeReport } from "@/lib/ai";
import { getCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "The request was not valid JSON." }, { status: 400 });
  }

  const ingredients = typeof body.ingredients === "string" ? body.ingredients : "";
  if (ingredients.trim().length < 3) {
    return NextResponse.json({ error: "Please provide an ingredient list." }, { status: 400 });
  }
  if (ingredients.length > 6000) {
    return NextResponse.json({ error: "The ingredient list is too long (limit 6000 characters)." }, { status: 400 });
  }
  if (!getCategory(body.category)) {
    return NextResponse.json({ error: "Please choose a product category." }, { status: 400 });
  }

  const report = analyzeIngredients({
    ingredients,
    categoryId: body.category,
    productName: String(body.productName || "").slice(0, 120),
    brand: String(body.brand || "").slice(0, 120),
    source: ["manual", "ocr", "barcode"].includes(body.source) ? body.source : "manual",
  });

  if (report.counts.total === 0) {
    return NextResponse.json({ error: "No ingredients could be read from that text." }, { status: 400 });
  }
  if (report.counts.total > 150) {
    return NextResponse.json({ error: "Too many ingredients (limit 150)." }, { status: 400 });
  }

  if (body.useAI === true) {
    report.ai = await summarizeReport(report);
  }

  return NextResponse.json(report);
}
