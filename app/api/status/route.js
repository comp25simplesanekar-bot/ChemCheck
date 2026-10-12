import { NextResponse } from "next/server";
import { aiConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ aiEnabled: aiConfigured(), barcodeLookup: true });
}
