import { NextResponse } from "next/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { isReviewServiceType } from "@/lib/reviews/scope";
import { isReviewMediaPath } from "@/lib/storage/reviewMedia";

type Body = {
  authorName: string;
  rating: number;
  body: string;
  email?: string;
  productId?: string;
  serviceType?: string;
  imagePath?: string;
};

export async function POST(request: Request) {
  try {
    if (!hasAdminClient()) {
      return NextResponse.json(
        { error: "Reviews are temporarily unavailable." },
        { status: 503 }
      );
    }

    const payload = (await request.json()) as Body;
    const authorName = payload.authorName?.trim() ?? "";
    const body = payload.body?.trim() ?? "";
    const rating = Number(payload.rating);
    const email = payload.email?.trim().toLowerCase() || null;
    const productId = payload.productId?.trim() || null;
    const rawService = payload.serviceType?.trim() || null;
    const imagePath = payload.imagePath?.trim() || null;

    if (!authorName || authorName.length < 2) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please choose a rating from 1 to 5 stars." },
        { status: 400 }
      );
    }
    if (!body || body.length < 10) {
      return NextResponse.json(
        { error: "Please write a short review (at least 10 characters)." },
        { status: 400 }
      );
    }
    if (body.length > 2000) {
      return NextResponse.json(
        { error: "Review is too long (max 2000 characters)." },
        { status: 400 }
      );
    }
    if (imagePath && !isReviewMediaPath(imagePath)) {
      return NextResponse.json(
        { error: "Invalid photo upload." },
        { status: 400 }
      );
    }

    let serviceType: "home_repair" | "smart_home_install" | null = null;
    if (rawService) {
      if (!isReviewServiceType(rawService)) {
        return NextResponse.json(
          { error: "Invalid service for this review." },
          { status: 400 }
        );
      }
      serviceType = rawService;
    }

    if (productId && serviceType) {
      return NextResponse.json(
        { error: "Choose either a product or a service review, not both." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (productId) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id")
        .eq("id", productId)
        .maybeSingle();
      if (productError || !product) {
        return NextResponse.json(
          { error: "That product could not be found." },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        author_name: authorName.slice(0, 80),
        rating,
        body: body.slice(0, 2000),
        email,
        product_id: productId,
        service_type: serviceType,
        image_path: imagePath,
        is_published: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("review insert", error);
      return NextResponse.json(
        { error: "Could not save your review. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
