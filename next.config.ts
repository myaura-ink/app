import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // keep the dev badge clear of the reader's sidebar controls (bottom-left)
  devIndicators: { position: "bottom-right" },
  images: {
    // covers never change at a given url, so keep optimized copies for a month
    // instead of re-transforming (and re-billing) them every few hours
    minimumCacheTTL: 31 * 24 * 60 * 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      // covers uploaded through /api/upload
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/covers/**",
      },
    ],
  },
};

export default nextConfig;
