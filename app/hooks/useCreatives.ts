"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/contexts";
import { useToast } from "@/app/contexts/toast";

export interface CreativeSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  genre: string | null;
  published: number;
  authorId: string;
  createdAt: string | null;
  updatedAt: string;
  chapterCount?: number;
  publishedChapterCount?: number;
}

export interface ChapterSummary {
  id: string;
  creativeId: string;
  title: string;
  slug: string;
  content: string | null;
  order: number;
  published: number;
  createdAt: string | null;
  updatedAt: string;
}

export interface CreativeDetail extends CreativeSummary {
  authorName: string | null;
  authorSlug: string | null;
  chapters: ChapterSummary[];
  isAuthor: boolean;
}

export interface UserCreativesResponse {
  user: { id: string; name: string | null; slug: string; image: string | null; createdAt: string | null };
  creatives: CreativeSummary[];
}

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? "Request failed");
  return body;
};

// Fetch all creatives for a user (public or own portfolio)
export const useUserCreatives = (userSlug: string | undefined, token?: string | null) => {
  return useQuery<UserCreativesResponse>({
    queryKey: ["user-creatives", userSlug, !!token],
    queryFn: () =>
      fetchJson(`/api/users/${userSlug}/creatives`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    enabled: !!userSlug,
    staleTime: 30 * 1000,
  });
};

// Fetch a single creative with its chapters
export const useCreative = (slug: string | undefined, token?: string | null) => {
  return useQuery<CreativeDetail>({
    queryKey: ["creative", slug, !!token],
    queryFn: () =>
      fetchJson(`/api/creatives/${slug}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    enabled: !!slug,
    staleTime: 30 * 1000,
  });
};

// Create a new creative
export const useCreateCreative = () => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<CreativeSummary, Error, { title: string; description?: string; coverImage?: string; genre?: string }>({
    mutationFn: (data) =>
      fetchJson("/api/creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: (creative) => {
      queryClient.invalidateQueries({ queryKey: ["user-creatives"] });
      toast.success("Story created! Now add your first chapter.");
      router.push(`/creative/${creative.slug}`);
    },
    onError: (err) => toast.error(err.message),
  });
};

// Add a chapter to a creative
export const useCreateChapter = (creativeSlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    ChapterSummary,
    Error,
    { title: string; content?: string; published: boolean }
  >({
    mutationFn: (data) =>
      fetchJson(`/api/creatives/${creativeSlug}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["creative", creativeSlug] });
      queryClient.invalidateQueries({ queryKey: ["user-creatives"] });
      toast.success(vars.published ? "Chapter published!" : "Chapter saved as draft.");
    },
    onError: (err) => toast.error(err.message),
  });
};
