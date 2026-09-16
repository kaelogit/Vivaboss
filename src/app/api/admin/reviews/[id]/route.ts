import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
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

  const body = (await request.json()) as { is_published?: boolean };
  if (typeof body.is_published !== "boolean") {
    return NextResponse.json(
      { error: "Provide is_published (boolean)." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({ is_published: body.is_published })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("review patch", error);
    return NextResponse.json(
      { error: "Could not update review." },
      { status: 500 }
    );
  }

  return NextResponse.json({ review: data });
}

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
