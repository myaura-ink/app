import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  slug: string;
  image: string | null;
  roles: string[];
  lastSignedInAt: string | null;
  createdAt: string | null;
  updatedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
