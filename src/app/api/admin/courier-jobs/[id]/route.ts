import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { COURIER_JOB_STATUSES } from "@/lib/bookings/labels";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { CourierJobStatus } from "@/types/database";

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
    .from("courier_jobs")
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
    status?: CourierJobStatus;
    internal_notes?: string;
    notify_customer?: boolean;
  };

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("courier_jobs")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const updates: {
    status?: CourierJobStatus;
    internal_notes?: string | null;
  } = {};

  if (body.status) {
    if (!COURIER_JOB_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (body.internal_notes !== undefined) {
    updates.internal_notes = body.internal_notes.trim() || null;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("courier_jobs")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const statusChanged =
    Boolean(updates.status) && updates.status !== existing.status;
  const shouldNotify =
    statusChanged &&
    updates.status !== "new" &&
    body.notify_customer !== false;

  if (shouldNotify) {
    try {
      const { sendCourierJobStatusEmail } = await import(
        "@/lib/email/bookings"
      );
      await sendCourierJobStatusEmail(id);
    } catch (err) {
      console.error("courier status email", err);
    }
  }

  return NextResponse.json({
    job: data,
    customer_notified: shouldNotify,
  });
}
