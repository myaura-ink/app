import type { Metadata } from "next";
import { site } from "@/content";
import { isBlobUrl } from "@/lib/utils/cover";

interface SeoImage {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

interface BuildMetadataInput {
  title: string;
  description: string;
  // site-relative, e.g. /story/foo; resolved against metadataBase from the root layout
  path: string;
  keywords?: string[];
  image?: SeoImage;
  // drafts and private screens shouldn't show up in search results
  noindex?: boolean;
  // skip the "· Aura" suffix for titles that already carry the brand (the home page)
  absoluteTitle?: boolean;
  openGraph?:
    | { type: "website" }
    | { type: "book"; authors?: string[]; tags?: string[]; releaseDate?: string }
    | {
        type: "article";
        authors?: string[];
        section?: string;
        tags?: string[];
        publishedTime?: string;
        modifiedTime?: string;
      }
    | { type: "profile"; username?: string };
}

// covers uploaded through /api/upload are always 1000x1400 (see cover-input/compress.ts); others are unknown
export const coverSeoImage = (coverImage: string | null | undefined, alt: string): SeoImage | undefined => {
  if (!coverImage) return undefined;
  return isBlobUrl(coverImage) ? { url: coverImage, width: 1000, height: 1400, alt } : { url: coverImage, alt };
};

// child segments replace (not merge) openGraph/twitter, so every page builds the full set here
export const buildMetadata = ({
  title,
  description,
  path,
  keywords,
  image,
  noindex,
  absoluteTitle,
  openGraph = { type: "website" },
}: BuildMetadataInput): Metadata => {
  const fullTitle = absoluteTitle ? title : `${title}${site.titleSeparator}${site.name}`;
  const ogImage = image ?? site.defaultImage;
  // portrait covers look cramped in the wide card, so only the default banner gets it
  const largeCard = !image || (image.width ?? 0) > (image.height ?? 0);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      ...openGraph,
      title: fullTitle,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      images: [ogImage],
    },
    twitter: {
      card: largeCard ? "summary_large_image" : "summary",
      title: fullTitle,
      description,
      site: site.twitterHandle,
      images: [{ url: ogImage.url, alt: ogImage.alt }],
    },
  };
};

// plain-text snippet of markdown for meta descriptions, cut at a word boundary
export const toExcerpt = (markdown: string | null | undefined, length = site.descriptionLength) => {
  if (!markdown) return "";
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= length) return text;
  const cut = text.slice(0, length - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > length * 0.6 ? cut.lastIndexOf(" ") : cut.length).replace(/[\s,.;:]+$/, "")}…`;
};
