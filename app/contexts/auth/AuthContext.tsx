import { User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
