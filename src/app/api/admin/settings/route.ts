import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import {
  SETTINGS_KEYS,
  defaultBrand,
  defaultContact,
  defaultNotifications,
  defaultShipping,
  parseBrand,
  parseContact,
  parseNotifications,
  parseShipping,
  type BrandSettings,
  type ContactSettings,
  type NotificationsSettings,
  type ShippingSettings,
} from "@/lib/content/siteSettings";

export type AdminSettingsPayload = {
  contact: ContactSettings;
  brand: BrandSettings;
  shipping: ShippingSettings;
  notifications: NotificationsSettings;
};

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json(
      {
        error: "Supabase not configured.",
        settings: {
          contact: defaultContact(),
          brand: defaultBrand(),
          shipping: defaultShipping(),
          notifications: defaultNotifications(),
        } satisfies AdminSettingsPayload,
      },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [...SETTINGS_KEYS]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  const settings: AdminSettingsPayload = {
    contact: parseContact(map.get("contact") ?? null),
    brand: parseBrand(map.get("brand") ?? null),
    shipping: parseShipping(map.get("shipping") ?? null),
    notifications: parseNotifications(map.get("notifications") ?? null),
  };

  return NextResponse.json({
    settings,
    stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live")
      ? "live"
      : process.env.STRIPE_SECRET_KEY
        ? "test"
        : "unset",
  });
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: Partial<AdminSettingsPayload>;
  try {
    body = (await request.json()) as Partial<AdminSettingsPayload>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const rows: { key: string; value: Json }[] = [];

  if (body.contact) {
    rows.push({ key: "contact", value: parseContact(body.contact as Json) });
  }
  if (body.brand) {
    rows.push({ key: "brand", value: parseBrand(body.brand as Json) });
  }
  if (body.shipping) {
    rows.push({
      key: "shipping",
      value: parseShipping(body.shipping as Json),
    });
  }
  if (body.notifications) {
    rows.push({
      key: "notifications",
      value: parseNotifications(body.notifications as Json),
    });
  }

  if (!rows.length) {
    return NextResponse.json(
      { error: "Provide contact, brand, shipping, and/or notifications." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert(rows, {
    onConflict: "key",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
