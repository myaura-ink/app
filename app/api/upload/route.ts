import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { COVER_CACHE_SECONDS, COVER_UPLOAD_TYPES, MAX_COVER_UPLOAD_BYTES } from "@/lib/utils/cover";

// issues short-lived tokens so the browser can upload a cover straight to Vercel Blob.
// the url is saved through the normal create/update routes, so there's no completion callback
export async function POST(request: NextRequest) {
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

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(`covers/${payload.id}/`)) throw new Error("Invalid upload path");
        return {
          allowedContentTypes: COVER_UPLOAD_TYPES,
          maximumSizeInBytes: MAX_COVER_UPLOAD_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: COVER_CACHE_SECONDS,
        };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Upload failed" }, { status: 400 });
  }
}
