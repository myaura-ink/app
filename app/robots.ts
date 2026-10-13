import type { MetadataRoute } from "next";
import { config } from "./config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // authoring screens stay crawlable so bots can see their noindex; blocking them would hide it
      disallow: ["/api/"],
    },
    sitemap: `${config.platform}/sitemap.xml`,
  };
}
