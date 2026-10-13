"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/app/contexts";
import { useToast } from "@/app/contexts/toast";
import type { ChapterPage, SelectStoryWithAuthor } from "@/lib";

export interface StorySummary {
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
  storyId: string;
  title: string;
  slug: string;
  content: string | null;
  order: number;
  published: number;
  createdAt: string | null;
  updatedAt: string;
}

export interface StoryDetail extends StorySummary {
  authorName: string | null;
  authorSlug: string | null;
  chapters: ChapterPage;
  isAuthor: boolean;
}

export interface UserStoriesResponse {
  user: { id: string; name: string | null; slug: string; image: string | null; createdAt: string | null };
  stories: StorySummary[];
}

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? "Request failed");
  return body;
};

// Fetch all stories for a user (public or own profile)
export const useUserStories = (userSlug: string | undefined, token?: string | null) => {
  return useQuery<UserStoriesResponse>({
    queryKey: ["user-stories", userSlug, !!token],
    queryFn: () =>
      fetchJson(`/api/users/${userSlug}/stories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    enabled: !!userSlug,
    staleTime: 30 * 1000,
  });
};

// Fetch a single story with its chapters
export const useStory = (slug: string | undefined, token?: string | null) => {
  return useQuery<StoryDetail>({
    queryKey: ["story", slug, !!token],
    queryFn: () =>
      fetchJson(`/api/stories/${slug}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    enabled: !!slug,
    staleTime: 30 * 1000,
  });
};

// Update a story's details, tags, or published state (author only)
export const useUpdateStory = (slug: string) => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    StorySummary,
    Error,
    { title?: string; description?: string; coverImage?: string; genre?: string; tags?: string[]; published?: boolean }
  >({
    mutationFn: (data) =>
      fetchJson(`/api/stories/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["story", slug] });
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      if (vars.published === undefined) toast.success("Story updated.");
      else toast.success(vars.published ? "Story published!" : "Story moved back to drafts.");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
};

// Create a new story
export const useCreateStory = () => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    StorySummary,
    Error,
    { title: string; description?: string; coverImage?: string; genre?: string; tags?: string[] }
  >({
    mutationFn: (data) =>
      fetchJson("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: (story) => {
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      toast.success("Story created! Now add your first chapter.");
      router.push(`/story/${story.slug}`);
    },
    onError: (err) => toast.error(err.message),
  });
};

// Fetch a single chapter's full content (author only, for editing)
export const useChapterContent = (storySlug: string, chapterSlug: string, enabled: boolean) => {
  const { token } = useAuthContext();
  return useQuery<ChapterSummary>({
    queryKey: ["chapter-content", storySlug, chapterSlug],
    queryFn: () =>
      fetchJson(`/api/stories/${storySlug}/chapters/${chapterSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: enabled && !!token,
    staleTime: 0,
  });
};

// Edit a chapter
export const useEditChapter = (storySlug: string, chapterSlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<ChapterSummary, Error, { title?: string; content?: string; published?: boolean }>({
    mutationFn: (data) =>
      fetchJson(`/api/stories/${storySlug}/chapters/${chapterSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["chapter-content", storySlug, chapterSlug], updated);
      queryClient.invalidateQueries({ queryKey: ["story", storySlug] });
      toast.success("Chapter updated.");
    },
    onError: (err) => toast.error(err.message),
  });
};

// Delete a chapter
export const useDeleteChapter = (storySlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { chapterSlug: string }>({
    mutationFn: async ({ chapterSlug }) => {
      const res = await fetch(`/api/stories/${storySlug}/chapters/${chapterSlug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Delete failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story", storySlug] });
      toast.success("Chapter deleted.");
    },
    onError: (err) => toast.error(err.message),
  });
};

// Check if the current user has already critiqued a story
export const useHasUserCritiqued = (storySlug: string | undefined) => {
  const { token, user } = useAuthContext();
  return useQuery<{ critiqued: boolean }>({
    queryKey: ["has-critiqued", storySlug, user?.id],
    queryFn: () =>
      fetchJson(`/api/stories/${storySlug}/critiques/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!storySlug && !!user,
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

interface CritiquePage {
  items: CritiqueSummary[];
  nextOffset: number | null;
  total: number;
}

const CRITIQUE_PAGE_SIZE = 10;

// critiques for a work, newest first, loaded a page at a time
export const useCritiques = (storySlug: string | undefined) => {
  return useInfiniteQuery<CritiquePage>({
    queryKey: ["critiques", storySlug],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(CRITIQUE_PAGE_SIZE), offset: String(pageParam) });
      return fetchJson(`/api/stories/${storySlug}/critiques?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
    enabled: !!storySlug,
    staleTime: 30 * 1000,
  });
};

export const useAddCritique = (storySlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<CritiqueSummary, Error, { body: string; rating: number }>({
    mutationFn: (data) =>
      fetchJson(`/api/stories/${storySlug}/critiques`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["critiques", storySlug] });
      toast.success("Critique posted!");
    },
    onError: (err) => toast.error(err.message),
  });
};

// Library
export const useLibraryStatus = (storySlug: string | undefined) => {
  const { token } = useAuthContext();
  return useQuery<{ saved: boolean }>({
    queryKey: ["library", storySlug, !!token],
    queryFn: () =>
      fetchJson(`/api/library/${storySlug}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    enabled: !!storySlug,
    staleTime: 60 * 1000,
  });
};

export const useToggleLibrary = (storySlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<{ saved: boolean }, Error, { saved: boolean }>({
    mutationFn: ({ saved }) =>
      fetchJson(`/api/library/${storySlug}`, {
        method: saved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["library", storySlug, true], data);
      toast.success(data.saved ? "Added to your library!" : "Removed from your library.");
    },
    onError: (err) => toast.error(err.message),
  });
};

// Add a chapter to a story
export const useCreateChapter = (storySlug: string) => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<ChapterSummary, Error, { title: string; content?: string; published: boolean }>({
    mutationFn: (data) =>
      fetchJson(`/api/stories/${storySlug}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["story", storySlug] });
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      toast.success(vars.published ? "Chapter published!" : "Chapter saved as draft.");
    },
    onError: (err) => toast.error(err.message),
  });
};

export interface TagSummary {
  name: string;
  slug: string;
  uses?: number;
}

// suggestions for the tag input, most used first
export const useTagSuggestions = (query: string) => {
  return useQuery<TagSummary[]>({
    queryKey: ["tags", query],
    queryFn: () => fetchJson(`/api/tags?q=${encodeURIComponent(query)}`),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
};

export const useUpdateStoryTags = (storySlug: string) => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<{ tags: TagSummary[] }, Error, string[]>({
    mutationFn: (tags) =>
      fetchJson(`/api/stories/${storySlug}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tags }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tags updated.");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
};

// Delete several of the current user's stories at once
export const useDeleteStories = () => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<{ deleted: string[] }, Error, string[]>({
    mutationFn: (ids) =>
      fetchJson("/api/stories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: ({ deleted }) => {
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success(deleted.length === 1 ? "Story deleted." : `${deleted.length} stories deleted.`);
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
};

// Remove several stories from the current user's library at once
export const useRemoveFromLibrary = () => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<{ removed: string[] }, Error, string[]>({
    mutationFn: (ids) =>
      fetchJson("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: ({ removed }) => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      toast.success(
        removed.length === 1 ? "Removed from your library." : `${removed.length} stories removed from your library.`,
      );
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
};

export type StorySearchItem = SelectStoryWithAuthor & { tags: TagSummary[] };

interface StorySearchPage {
  items: StorySearchItem[];
  nextOffset: number | null;
}

const SEARCH_PAGE_SIZE = 12;

// published works matching a text query and all given tags, loaded a page at a time
export const useSearchStories = (query: string, tags: string[]) => {
  return useInfiniteQuery<StorySearchPage>({
    queryKey: ["story-search", query, tags],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(SEARCH_PAGE_SIZE), offset: String(pageParam) });
      if (query) params.set("q", query);
      for (const tag of tags) params.append("tag", tag);
      return fetchJson(`/api/stories?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
    staleTime: 30 * 1000,
  });
};

// ─── Chapter management (author only) ───────────────────────────────────────
// Each refreshes the server-rendered story pages, which read chapters on the server.

// Save a new reading order; `order` must list every chapter id exactly once
export const useReorderChapters = (storySlug: string) => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();

  return useMutation<{ order: string[] }, Error, string[]>({
    mutationFn: (order) =>
      fetchJson(`/api/stories/${storySlug}/chapters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order }),
      }),
    onSuccess: () => {
      toast.success("Chapter order saved.");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
};

// Publish or unpublish several chapters at once
export const useSetChaptersPublished = (storySlug: string) => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();

  return useMutation<{ updated: string[]; published: boolean }, Error, { ids: string[]; published: boolean }>({
    mutationFn: (data) =>
      fetchJson(`/api/stories/${storySlug}/chapters`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      }),
    onSuccess: ({ updated, published }) => {
      const what = updated.length === 1 ? "Chapter" : `${updated.length} chapters`;
      toast.success(published ? `${what} published.` : `${what} moved to drafts.`);
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
};

// Delete several chapters at once
export const useDeleteChapters = (storySlug: string) => {
  const { token } = useAuthContext();
  const router = useRouter();
  const toast = useToast();

  return useMutation<{ deleted: string[] }, Error, string[]>({
    mutationFn: (ids) =>
      fetchJson(`/api/stories/${storySlug}/chapters`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: ({ deleted }) => {
      toast.success(deleted.length === 1 ? "Chapter deleted." : `${deleted.length} chapters deleted.`);
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
};
