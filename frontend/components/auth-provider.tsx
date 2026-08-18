"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/services/profile";
import type { UserProfile } from "@chatx/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  setLocalUser: (u: User | Record<string, unknown>) => void;
  clearLocalUser: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  setLocalUser: () => {},
  clearLocalUser: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUserStr = localStorage.getItem("chatx_active_user");
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && savedUser.id) return savedUser;
        } catch { /* parse fallback */ }
      }
    }
    return null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedUserStr = localStorage.getItem("chatx_active_user");
      if (savedUserStr) return false;
    }
    return true;
  });

  const fetchUserProfile = async (userId: string) => {
    try {
      const p = await getProfile(userId);
      if (p) {
        setProfile(p);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // 1. Instant LocalStorage Session Hydration on Tab Refresh (F5)
    if (typeof window !== "undefined") {
      const savedUserStr = localStorage.getItem("chatx_active_user");
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && savedUser.id) {
            setUser(savedUser);
            fetchUserProfile(savedUser.id);
          }
        } catch { /* parse fallback */ }
      }
    }

    // 2. Initial Supabase Session Check on Tab Load / Re-open
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("chatx_active_user", JSON.stringify(session.user));
        }
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // 3. Real-time Supabase Auth Listener for Sign-In, Token Refresh, and Sign-Out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("chatx_active_user", JSON.stringify(currentSession.user));
          }
          await fetchUserProfile(currentSession.user.id);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setProfile(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("chatx_active_user");
          }
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setLocalUser = (u: User | Record<string, unknown> | any) => {
    setUser(u as User);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_active_user", JSON.stringify(u));
      localStorage.setItem("chatx_view_mode", "workspace");
    }
    if (u?.id) {
      fetchUserProfile(u.id);
    }
  };

  const clearLocalUser = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("chatx_") || key.startsWith("sb-"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem("chatx_view_mode", "landing");
      } catch { /* storage fallback */ }
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        setLocalUser,
        clearLocalUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
