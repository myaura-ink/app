import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib";
import { signToken } from "@/lib/auth";
import { matchPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  const existing = result[0];
  const matched = await matchPassword(password, existing.password);
  if (!matched) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  await db.update(users).set({ lastSignedInAt: new Date() }).where(eq(users.id, existing.id));

  const token = await signToken({
    id: existing.id,
    email: existing.email,
    name: existing.name,
    slug: existing.slug,
    roles: existing.roles,
  });

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
  return NextResponse.json({ user, token });
}
