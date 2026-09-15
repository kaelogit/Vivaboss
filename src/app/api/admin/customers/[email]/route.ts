import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ email: string }> };

function decodeEmail(raw: string): string {
  try {
    return decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Supabase not configured." },
      { status: 503 }
    );
  }

  const email = decodeEmail((await params).email);
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Match case-insensitively by fetching candidates and filtering —
  // PostgREST ilike on exact email is fine for admin volumes.
  const pattern = email.replace(/[%_]/g, "\\$&");

  const [orders, customs, services, couriers] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, order_number, status, full_name, total_gbp, created_at, email"
      )
      .ilike("email", pattern)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("custom_requests")
      .select(
        "id, status, product_name, full_name, created_at, quote_amount_gbp, email"
      )
      .ilike("email", pattern)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("service_jobs")
      .select(
        "id, status, job_type, full_name, postcode, created_at, email"
      )
      .ilike("email", pattern)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("courier_jobs")
      .select(
        "id, status, vertical, urgency, full_name, pickup_postcode, dropoff_postcode, created_at, email"
      )
      .ilike("email", pattern)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const err =
    orders.error?.message ||
    customs.error?.message ||
    services.error?.message ||
    couriers.error?.message;
  if (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const name =
    orders.data?.[0]?.full_name ||
    customs.data?.[0]?.full_name ||
    services.data?.[0]?.full_name ||
    couriers.data?.[0]?.full_name ||
    null;

  const hasAny =
    (orders.data?.length ?? 0) +
      (customs.data?.length ?? 0) +
      (services.data?.length ?? 0) +
      (couriers.data?.length ?? 0) >
    0;

  if (!hasAny) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  return NextResponse.json({
    customer: {
      email,
      name,
      orders: orders.data ?? [],
      customRequests: customs.data ?? [],
      serviceJobs: services.data ?? [],
      courierJobs: couriers.data ?? [],
    },
  });
}
