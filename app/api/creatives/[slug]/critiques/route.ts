import { NextRequest, NextResponse } from "next/server";
import { addCritique, getCritiquesByCreativeSlug, isCreativeAuthor } from "@/lib";
import { verifyToken } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const critiques = await getCritiquesByCreativeSlug(slug);
  return NextResponse.json(critiques);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await verifyToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }

  // Authors cannot critique their own work
  const isAuthor = await isCreativeAuthor(slug, payload.id);
  if (isAuthor) {
    return NextResponse.json({ message: "You cannot critique your own work" }, { status: 403 });
  }

  const { body, rating } = await request.json();
  if (!body?.trim()) {
    return NextResponse.json({ message: "Critique body is required" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Rating must be a whole number between 1 and 5" }, { status: 400 });
  }

  const critique = await addCritique(slug, payload.id, body.trim(), rating);
  return NextResponse.json(critique, { status: 201 });
}
