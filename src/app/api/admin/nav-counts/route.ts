import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { loadAdminNavCounts } from "@/lib/admin/navCounts";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const counts = await loadAdminNavCounts();
  return NextResponse.json(counts, {
    headers: { "Cache-Control": "no-store" },
  });
}
