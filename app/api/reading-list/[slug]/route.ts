import { NextRequest, NextResponse } from "next/server";
import { addToReadingList, isInReadingList, removeFromReadingList } from "@/lib";
import { verifyToken } from "@/lib/auth";

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return await verifyToken(authHeader.slice(7));
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const payload = await authenticate(request);
  if (!payload) return NextResponse.json({ saved: false });

  const saved = await isInReadingList(payload.id, slug);
  return NextResponse.json({ saved });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const payload = await authenticate(request);
  if (!payload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await addToReadingList(payload.id, slug);
  return NextResponse.json({ saved: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const payload = await authenticate(request);
  if (!payload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await removeFromReadingList(payload.id, slug);
  return NextResponse.json({ saved: false });
}
