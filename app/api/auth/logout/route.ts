import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib";

export async function POST() {
  const cookieStore = await cookies();
  await clearAuthCookies(cookieStore);
  return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}
