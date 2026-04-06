import { NextRequest, NextResponse } from "next/server";
import { hasUserCritiqued } from "@/lib";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ critiqued: false });
  }

  try {
    const payload = await verifyToken(authHeader.slice(7));
    const critiqued = await hasUserCritiqued(slug, payload.id);
    return NextResponse.json({ critiqued });
  } catch {
    return NextResponse.json({ critiqued: false });
  }
}
