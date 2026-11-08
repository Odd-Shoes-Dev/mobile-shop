import { NextResponse } from "next/server";
import { mapToSummary } from "@/features/catalogue/lib/mapToSummary";
import { listProducts } from "@/lib/db";

/** Read-only product list for client-side features (cart drawer, checkout) that need names/prices without prop-drilling the whole catalogue through every page. */
export async function GET() {
  try {
    const rows = await listProducts();
    return NextResponse.json({ products: rows.map(mapToSummary) });
  } catch {
    return NextResponse.json({ products: [], error: "Database not configured" }, { status: 503 });
  }
}
