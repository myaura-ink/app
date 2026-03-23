"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useSupabase } from "@/app/hooks/useSupabase";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (currentSession?.user) {
            setUser(currentSession.user);
          } else {
            setUser(null);
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Auth initialization failed"));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Sign out failed"));
    }
  };

  return <AuthContext.Provider value={{ user, loading, error, signOut }}>{children}</AuthContext.Provider>;
}
