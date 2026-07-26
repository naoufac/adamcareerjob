"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  name?: string | null;
  locale?: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await api<{ user: User }>("/api/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return <Ctx.Provider value={{ user, loading, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
