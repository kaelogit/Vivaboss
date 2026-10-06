import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import {
  REVIEW_MEDIA_BUCKET,
  optimizeReviewImage,
} from "@/lib/storage/reviewMedia";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

/** Public review photo upload — optimized WebP into public review-media. */
export async function POST(request: Request) {
  if (!hasAdminClient()) {
    return NextResponse.json(
      { error: "Uploads are temporarily unavailable." },
      { status: 503 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Use JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 8MB." },
        { status: 400 }
      );
    }

    const raw = Buffer.from(await file.arrayBuffer());
    const { buffer, contentType } = await optimizeReviewImage(raw);
    const storagePath = `reviews/${crypto.randomUUID()}.webp`;
    const supabase = createAdminClient();

    const { error } = await supabase.storage
      .from(REVIEW_MEDIA_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
        cacheControl: "31536000",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage
      .from(REVIEW_MEDIA_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      path: storagePath,
      url: data.publicUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
