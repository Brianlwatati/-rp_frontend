"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";
import {
  fetchMe,
  fetchRolePermissions,
  login as loginRequest,
  logout as logoutRequest,
} from "@/lib/auth";
import type { ErpPermission } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  permissions: ErpPermission[] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<ErpPermission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const hasToken =
      typeof window !== "undefined" && localStorage.getItem("ias_token");
    if (!hasToken) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(async (account) => {
        setUser(account);
        setPermissions(await fetchRolePermissions(account));
      })
      .catch(() => {
        setUser(null);
        setPermissions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const account = await loginRequest(email, password);
      setUser(account);
      setPermissions(await fetchRolePermissions(account));
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
    setPermissions(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
