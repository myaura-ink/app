import { del, list } from "@vercel/blob";
import { isNotNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/app/config";
import { db, stories } from "@/lib";

// leave fresh uploads alone; the author may still be filling in the form
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

// deletes covers that were uploaded but never saved to a story. run daily by vercel cron (vercel.json)
export async function GET(request: NextRequest) {
  const secret = config.cron.secret;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const referenced = await db
    .select({ coverImage: stories.coverImage })
    .from(stories)
    .where(isNotNull(stories.coverImage));
  const inUse = new Set(referenced.map((row) => row.coverImage));
  const cutoff = Date.now() - GRACE_PERIOD_MS;

  const orphans: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: "covers/", cursor });
    for (const blob of page.blobs) {
      if (blob.uploadedAt.getTime() < cutoff && !inUse.has(blob.url)) orphans.push(blob.url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  if (orphans.length) await del(orphans);
  return NextResponse.json({ deleted: orphans.length });
}
