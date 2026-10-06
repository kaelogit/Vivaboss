import sharp from "sharp";

export const REVIEW_MEDIA_BUCKET = "review-media";

const MAX_EDGE = 1280;
const WEBP_QUALITY = 78;

/** Resize + WebP for fast review photos. */
export async function optimizeReviewImage(
  input: Buffer
): Promise<{ buffer: Buffer; contentType: "image/webp" }> {
  const buffer = await sharp(input)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  return { buffer, contentType: "image/webp" };
}

export function reviewMediaPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${REVIEW_MEDIA_BUCKET}/${path}`;
}

export function isReviewMediaPath(value: string | null | undefined): boolean {
  if (!value) return false;
  if (value.startsWith("http://") || value.startsWith("https://")) return false;
  return value.startsWith("reviews/");
}
