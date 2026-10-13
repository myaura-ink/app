import { NextRequest, NextResponse } from "next/server";
import { clearSearchHistory, getSearchHistory, recordSearch } from "@/lib";
import { authenticateRequest } from "@/lib/auth";

const unauthorized = () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();
  return NextResponse.json({ items: await getSearchHistory(user.id) });
}

// { query }
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();

  const { query } = await request.json().catch(() => ({}));
  if (typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ message: "query is required" }, { status: 400 });
  }
  await recordSearch(user.id, query);
  return NextResponse.json({ recorded: true });
}

export async function DELETE(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();
  await clearSearchHistory(user.id);
  return NextResponse.json({ cleared: true });
}
