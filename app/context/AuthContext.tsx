"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  auth as authApi,
  users as usersApi,
  UserProfile,
  AuthTokens,
  setTokens,
  clearTokens,
  loadTokens,
  onAuthChange,
  getAccessToken,
} from "@/lib/api";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    username?: string;
    targetLanguage?: string;
    proficiency?: string;
  }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchMe = useCallback(async () => {
    loadTokens();
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
    onAuthChange(() => fetchMe());
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const data: AuthTokens = await authApi.login({ email, password });
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const data: AuthTokens = await authApi.register({ email, username, password });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    loadTokens();
    const rt = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    if (rt) {
      await authApi.logout(rt).catch(() => {});
    }
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const updateProfileFn = useCallback(
    async (data: { username?: string; targetLanguage?: string; proficiency?: string }) => {
      const updated = await usersApi.updateProfile(data);
      setUser(updated);
    },
    []
  );

  const uploadAvatarFn = useCallback(async (file: File) => {
    const updated = await usersApi.uploadAvatar(file);
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile: updateProfileFn,
        uploadAvatar: uploadAvatarFn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
