import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase not configured." },
      { status: 503 }
    );
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Missing review id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    console.error("review delete", error);
    return NextResponse.json(
      { error: "Could not delete review." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
