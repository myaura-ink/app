import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib";
import { signToken } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { toSlug, toUniqueSlug } from "@/lib/utils/slug";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return NextResponse.json({ message: "Email already in use" }, { status: 409 });
  }

  const baseSlug = toSlug(name || email.split("@")[0]);
  const slugConflict = await db.select().from(users).where(eq(users.slug, baseSlug));
  const slug = slugConflict.length > 0 ? toUniqueSlug(name || email.split("@")[0]) : baseSlug;

  const hashed = await hashPassword(password);
  const inserted = await db.insert(users).values({ name, email, password: hashed, slug }).returning();

  const created = inserted[0];
  const token = await signToken({
    id: created.id,
    email: created.email,
    name: created.name,
    slug: created.slug,
    roles: created.roles,
  });

  const user = {
    id: created.id,
    email: created.email,
    name: created.name,
    slug: created.slug,
    image: created.image,
    roles: created.roles,
    lastSignedInAt: created.lastSignedInAt,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
  return NextResponse.json({ user, token }, { status: 201 });
}
