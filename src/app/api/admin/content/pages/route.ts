import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { hasAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import {
  defaultPages,
  getAdminSetting,
  parsePages,
  upsertAdminSetting,
} from "@/lib/content/siteSettings";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase not configured.", content: defaultPages() },
      { status: 503 }
    );
  }

  const row = await getAdminSetting("pages");
  return NextResponse.json({
    content: parsePages(row?.value ?? null),
    updated_at: row?.updated_at ?? null,
  });
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const content = parsePages(body as Json);
  try {
    const saved = await upsertAdminSetting("pages", content);
    return NextResponse.json({
      content: parsePages(saved.value),
      updated_at: saved.updated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
