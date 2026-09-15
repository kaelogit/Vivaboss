import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { hasAdminClient } from "@/lib/supabase/admin";
import {
  isCustomerUploadPath,
  signCustomerUpload,
} from "@/lib/storage/customerUploads";

/** Admin: mint a fresh signed URL for a customer-uploads path. */
export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const body = (await request.json()) as { path?: string };
  const path = body.path?.trim();
  if (!path) {
    return NextResponse.json({ error: "path required." }, { status: 400 });
  }
  if (path.startsWith("http")) {
    return NextResponse.json({ url: path });
  }
  if (!isCustomerUploadPath(path)) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  const url = await signCustomerUpload(path, 60 * 60 * 24);
  if (!url) {
    return NextResponse.json({ error: "Could not sign URL." }, { status: 500 });
  }
  return NextResponse.json({ url });
}
