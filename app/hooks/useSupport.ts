"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/app/contexts";
import { useToast } from "@/app/contexts/toast";
import type { SupportSummary } from "@/lib/db/repo/support";

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? "Request failed");
  return body;
};

// pass enabled: false to read whatever is cached (e.g. from the roadmap page) without fetching
export const useSupport = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { token } = useAuthContext();
  return useQuery<SupportSummary>({
    queryKey: ["support", !!token],
    queryFn: () => fetchJson("/api/support", { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
    staleTime: 60 * 1000,
    enabled,
  });
};

export const useUpdateSupport = () => {
  const { token } = useAuthContext();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<SupportSummary, Error, { liked?: boolean; pledge?: number | null }>({
    mutationFn: (changes) =>
      fetchJson("/api/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(changes),
      }),
    onSuccess: (data, changes) => {
      queryClient.setQueryData(["support", true], data);
      if (changes.liked) toast.success("Thanks for the love!");
      if (changes.pledge) toast.success(`Noted: $${changes.pledge}/month. We'll email you before anything goes live.`);
      if (changes.pledge === 0) toast.success("No worries, thanks for telling us.");
    },
    onError: (err) => toast.error(err.message),
  });
};
