import type { Metadata } from "next";
import { buildMetadata } from "@/app/utils";
import { write } from "@/content";

// the page itself is a client component, so its metadata lives here
export const metadata: Metadata = buildMetadata({ ...write, path: "/write", noindex: true });

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
