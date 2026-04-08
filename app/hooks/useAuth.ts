"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/app/contexts";
import { useAuthContext } from "@/app/contexts";
import { useToast } from "@/app/contexts/toast";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

const fetchJson = async (url: string, options: RequestInit) => {
  const res = await fetch(url, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? "Request failed");
  return body;
};

export const useAuth = () => {
  const { user, token, setAuth, clearAuth } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const login = useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: (data) =>
      fetchJson("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: ({ user: authedUser, token: newToken }) => {
      setAuth(authedUser, newToken);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(`Welcome back, ${authedUser.name ?? authedUser.email}!`);
      router.push(`/portfolio/${authedUser.slug}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const register = useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: (data) =>
      fetchJson("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: ({ user: authedUser, token: newToken }) => {
      setAuth(authedUser, newToken);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Account created! Welcome aboard.");
      router.push(`/portfolio/${authedUser.slug}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const profile = useQuery<AuthUser>({
    queryKey: ["profile", token],
    queryFn: async () => {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Failed to fetch profile");
      return body;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const logout = useMutation<void, Error>({
    mutationFn: () =>
      fetchJson("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.info("You've been signed out.");
      router.push("/");
    },
    onError: () => toast.error("Failed to log out. Please try again."),
  });

  return { login, register, profile, logout, user, token };
};
