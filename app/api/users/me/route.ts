import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }

  const result = await db.select().from(users).where(eq(users.id, payload.id));
  if (result.length === 0) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const existing = result[0];
  const user = {
    id: existing.id,
    email: existing.email,
    name: existing.name,
    slug: existing.slug,
    image: existing.image,
    roles: existing.roles,
    lastSignedInAt: existing.lastSignedInAt,
    createdAt: existing.createdAt,
    updatedAt: existing.updatedAt,
  };
  return NextResponse.json(user);
}
