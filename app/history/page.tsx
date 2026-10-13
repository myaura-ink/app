import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/app/hooks/getUserFromCookie";
import { buildMetadata } from "@/app/utils";
import { history } from "@/content";
import { HistoryPageClient } from "./client-wrapper";

export const metadata: Metadata = buildMetadata({ ...history, path: "/history", noindex: true });

export default async function HistoryPage() {
  // history is private, so there's nothing to show signed out
  if (!(await getUserFromCookie())) redirect("/dive");
  return <HistoryPageClient />;
}
