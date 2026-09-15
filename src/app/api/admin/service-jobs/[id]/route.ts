import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { SERVICE_JOB_STATUSES } from "@/lib/bookings/labels";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { ServiceJobStatus } from "@/types/database";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("service_jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ job: data });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: ServiceJobStatus;
    internal_notes?: string;
    scheduled_at?: string | null;
  };

  const updates: {
    status?: ServiceJobStatus;
    internal_notes?: string | null;
    scheduled_at?: string | null;
  } = {};

  if (body.status) {
    if (!SERVICE_JOB_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.internal_notes !== undefined) {
    updates.internal_notes = body.internal_notes.trim() || null;
  }
  if (body.scheduled_at !== undefined) {
    updates.scheduled_at = body.scheduled_at || null;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("service_jobs")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job: data });
}
