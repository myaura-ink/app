import { NextRequest, NextResponse } from "next/server";
import { searchTags } from "@/lib";
import { normalizeTag } from "@/lib/utils/tags";

// ?q=fan returns matching tags, most used first
export async function GET(request: NextRequest) {
  const query = normalizeTag(request.nextUrl.searchParams.get("q") ?? "").name;
  return NextResponse.json(await searchTags(query));
}
