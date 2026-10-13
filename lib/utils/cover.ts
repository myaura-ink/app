// hosts next/image is configured to serve covers from (see next.config.ts)
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const ALLOWED_COVER_HOSTS = ["picsum.photos"];

// what authors can pick; the browser resizes it before upload (see cover-input/compress.ts)
export const COVER_INPUT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_COVER_INPUT_BYTES = 20 * 1024 * 1024;

// what actually reaches blob storage. a compressed cover is ~100-200 KB,
// so this cap only stops uploads that skipped compression
export const COVER_UPLOAD_TYPES = ["image/webp", "image/jpeg"];
export const MAX_COVER_UPLOAD_BYTES = 1024 * 1024;

// uploads get a random suffix and are never overwritten, so they can be cached for good
export const COVER_CACHE_SECONDS = 365 * 24 * 60 * 60;

const parseHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

export const isBlobUrl = (value: string | null | undefined): value is string =>
  !!value && !!parseHttpsUrl(value)?.hostname.endsWith(BLOB_HOST_SUFFIX);

export const isAllowedCoverUrl = (value: string) => {
  const url = parseHttpsUrl(value);
  return !!url && (url.hostname.endsWith(BLOB_HOST_SUFFIX) || ALLOWED_COVER_HOSTS.includes(url.hostname));
};
