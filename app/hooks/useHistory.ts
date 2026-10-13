"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/app/contexts";
import { useToast } from "@/app/contexts/toast";
import type { ReadingHistoryItem, SearchHistoryItem } from "@/lib";

const READING_KEY = ["history", "reading"];
const SEARCHES_KEY = ["history", "searches"];

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? "Request failed");
  return body;
};

const useAuthedFetch = () => {
  const { token } = useAuthContext();
  const authedFetch = (url: string, init: RequestInit = {}) =>
    fetchJson(url, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
    });
  return { token, authedFetch };
};

// ─── Reading ────────────────────────────────────────────────────────────────

export const useReadingHistory = () => {
  const { token, authedFetch } = useAuthedFetch();
  return useQuery<ReadingHistoryItem[]>({
    queryKey: READING_KEY,
    queryFn: async () => (await authedFetch("/api/history/reading")).items,
    enabled: !!token,
  });
};

// remembers the chapter a signed-in reader just opened; silent, since it runs in the background
export const useRecordRead = () => {
  const { token, authedFetch } = useAuthedFetch();
  const queryClient = useQueryClient();
  return useMutation<{ recorded: boolean }, Error, { storySlug: string; chapterSlug: string }>({
    mutationFn: (body) =>
      token
        ? authedFetch("/api/history/reading", { method: "PUT", body: JSON.stringify(body) })
        : Promise.resolve({ recorded: false }),
    onSuccess: ({ recorded }) => {
      if (recorded) queryClient.invalidateQueries({ queryKey: READING_KEY });
    },
  });
};

export const useRemoveReadingEntry = () => {
  const { authedFetch } = useAuthedFetch();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<unknown, Error, string, { previous?: ReadingHistoryItem[] }>({
    mutationFn: (storyId) => authedFetch(`/api/history/reading/${storyId}`, { method: "DELETE" }),
    // drop the row right away and put it back if the request fails
    onMutate: async (storyId) => {
      await queryClient.cancelQueries({ queryKey: READING_KEY });
      const previous = queryClient.getQueryData<ReadingHistoryItem[]>(READING_KEY);
      queryClient.setQueryData<ReadingHistoryItem[]>(READING_KEY, (items) =>
        items?.filter((item) => item.story.id !== storyId),
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      queryClient.setQueryData(READING_KEY, context?.previous);
      toast.error(err.message);
    },
  });
};

export const useClearReadingHistory = () => {
  const { authedFetch } = useAuthedFetch();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: () => authedFetch("/api/history/reading", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.setQueryData(READING_KEY, []);
      toast.success("Reading history cleared.");
    },
    onError: (err) => toast.error(err.message),
  });
};

// ─── Searches ───────────────────────────────────────────────────────────────

export const useSearchHistory = () => {
  const { token, authedFetch } = useAuthedFetch();
  return useQuery<SearchHistoryItem[]>({
    queryKey: SEARCHES_KEY,
    queryFn: async () => (await authedFetch("/api/history/searches")).items,
    enabled: !!token,
  });
};

// saves a search the reader committed to; a no-op when signed out
export const useRecordSearch = () => {
  const { token, authedFetch } = useAuthedFetch();
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (query) =>
      token && query.trim()
        ? authedFetch("/api/history/searches", { method: "POST", body: JSON.stringify({ query }) })
        : Promise.resolve(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SEARCHES_KEY }),
  });
};

export const useRemoveSearchEntry = () => {
  const { authedFetch } = useAuthedFetch();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<unknown, Error, string, { previous?: SearchHistoryItem[] }>({
    mutationFn: (id) => authedFetch(`/api/history/searches/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SEARCHES_KEY });
      const previous = queryClient.getQueryData<SearchHistoryItem[]>(SEARCHES_KEY);
      queryClient.setQueryData<SearchHistoryItem[]>(SEARCHES_KEY, (items) => items?.filter((item) => item.id !== id));
      return { previous };
    },
    onError: (err, _id, context) => {
      queryClient.setQueryData(SEARCHES_KEY, context?.previous);
      toast.error(err.message);
    },
  });
};

export const useClearSearchHistory = () => {
  const { authedFetch } = useAuthedFetch();
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: () => authedFetch("/api/history/searches", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.setQueryData(SEARCHES_KEY, []);
      toast.success("Search history cleared.");
    },
    onError: (err) => toast.error(err.message),
  });
};
