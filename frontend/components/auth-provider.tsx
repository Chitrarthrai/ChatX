"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/services/profile";
import type { UserProfile } from "@chatx/types";

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  setLocalUser: (u: any) => void;
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
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const p = await getProfile(userId);
      setProfile(p);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Check local storage fallback user first
    if (typeof window !== "undefined") {
      const savedUserStr = localStorage.getItem("chatx_active_user");
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          setUser(savedUser);
          setProfile({
            id: savedUser.id || "u-active",
            username: savedUser.email?.split("@")[0] || "user",
            fullName: savedUser.user_metadata?.full_name || savedUser.email || "Active User",
            email: savedUser.email || "user@chatx.platform",
            avatarUrl: undefined,
            status: "online",
            customStatus: "Working in ChatX",
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch { /* parse fallback */ }
      }
    }

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
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

  const setLocalUser = (u: any) => {
    setUser(u);
    const mockProf: UserProfile = {
      id: u.id || "u-active",
      username: u.email?.split("@")[0] || "user",
      fullName: u.user_metadata?.full_name || u.email || "Active User",
      email: u.email || "user@chatx.platform",
      avatarUrl: undefined,
      status: "online",
      customStatus: "Working in ChatX",
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfile(mockProf);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatx_active_user", JSON.stringify(u));
    }
  };

  const clearLocalUser = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatx_active_user");
      localStorage.setItem("chatx_view_mode", "landing");
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
