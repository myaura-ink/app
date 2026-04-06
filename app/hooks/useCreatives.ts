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

// Fetch a single chapter's full content (author only, for editing)
export const useChapterContent = (creativeSlug: string, chapterSlug: string, enabled: boolean) => {
  const { token } = useAuthContext();
  return useQuery<ChapterSummary>({
    queryKey: ["chapter-content", creativeSlug, chapterSlug],
    queryFn: () =>
      fetchJson(`/api/creatives/${creativeSlug}/chapters/${chapterSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: enabled && !!token,
    staleTime: Infinity,
  });
};

// Edit a chapter
export const useEditChapter = (creativeSlug: string, chapterSlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<ChapterSummary, Error, { title?: string; content?: string; published?: boolean }>({
    mutationFn: (data) =>
      fetchJson(`/api/creatives/${creativeSlug}/chapters/${chapterSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative", creativeSlug] });
      toast.success("Chapter updated.");
    },
    onError: (err) => toast.error(err.message),
  });
};

// Delete a chapter
export const useDeleteChapter = (creativeSlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { chapterSlug: string }>({
    mutationFn: async ({ chapterSlug }) => {
      const res = await fetch(`/api/creatives/${creativeSlug}/chapters/${chapterSlug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Delete failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative", creativeSlug] });
      toast.success("Chapter deleted.");
    },
    onError: (err) => toast.error(err.message),
  });
};

// Check if the current user has already critiqued a creative
export const useHasUserCritiqued = (creativeSlug: string | undefined) => {
  const { token, user } = useAuthContext();
  return useQuery<{ critiqued: boolean }>({
    queryKey: ["has-critiqued", creativeSlug, user?.id],
    queryFn: () =>
      fetchJson(`/api/creatives/${creativeSlug}/critiques/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!creativeSlug && !!user,
    staleTime: 60 * 1000,
  });
};

// Critiques
export interface CritiqueAuthor {
  id: string;
  name: string | null;
  slug: string;
}

export interface CritiqueSummary {
  id: string;
  body: string;
  rating: number;
  createdAt: string | null;
  author: CritiqueAuthor;
}

export const useCritiques = (creativeSlug: string | undefined) => {
  return useQuery<CritiqueSummary[]>({
    queryKey: ["critiques", creativeSlug],
    queryFn: () => fetchJson(`/api/creatives/${creativeSlug}/critiques`),
    enabled: !!creativeSlug,
    staleTime: 30 * 1000,
  });
};

export const useAddCritique = (creativeSlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<CritiqueSummary, Error, { body: string; rating: number }>({
    mutationFn: (data) =>
      fetchJson(`/api/creatives/${creativeSlug}/critiques`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["critiques", creativeSlug] });
      toast.success("Critique posted!");
    },
    onError: (err) => toast.error(err.message),
  });
};

// Reading list
export const useReadingListStatus = (creativeSlug: string | undefined) => {
  const { token } = useAuthContext();
  return useQuery<{ saved: boolean }>({
    queryKey: ["reading-list", creativeSlug, !!token],
    queryFn: () =>
      fetchJson(`/api/reading-list/${creativeSlug}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    enabled: !!creativeSlug,
    staleTime: 60 * 1000,
  });
};

export const useToggleReadingList = (creativeSlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<{ saved: boolean }, Error, { saved: boolean }>({
    mutationFn: ({ saved }) =>
      fetchJson(`/api/reading-list/${creativeSlug}`, {
        method: saved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["reading-list", creativeSlug, true], data);
      toast.success(data.saved ? "Added to reading list!" : "Removed from reading list.");
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
