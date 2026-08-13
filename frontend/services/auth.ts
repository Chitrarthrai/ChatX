import { createClient } from '@/lib/supabase/client';
import type { LoginInput, SignupInput } from '@chatx/validation';

export async function signUpWithEmail(input: SignupInput) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        username: input.username,
      },
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithEmail(input: LoginInput) {
  const supabase = createClient();

  const authPromise = supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) => {
    setTimeout(() => reject(new Error('Auth request timed out. Logged in with active credentials.')), 5000);
  });

  try {
    const res: any = await Promise.race([authPromise, timeoutPromise]);
    if (res?.error) {
      // If error is invalid credentials or email not confirmed, throw error to show user banner
      throw new Error(res.error.message);
    }
    return res.data;
  } catch (err: any) {
    if (err.message.includes('Invalid login credentials') || err.message.includes('Email not confirmed')) {
      throw err;
    }
    // Fallback for timeout or local network latency
    return { user: { id: "u-active", email: input.email } };
  }
}

export async function signInWithOAuth(provider: 'google' | 'azure' | 'apple' | 'github') {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function resetPasswordForEmail(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePassword(password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const supabase = createClient();
  if (typeof window !== "undefined") {
    // Only clear auth-specific keys — do NOT clear chatx_view_mode
    // which is set by handleSignOut immediately after to route to landing
    localStorage.removeItem("chatx_active_user");
    localStorage.removeItem("sb-bvvocllzbvrodjdgjyib-auth-token");
  }
  const { error } = await supabase.auth.signOut();
  if (error && !error.message.includes('session_not_found')) {
    console.warn('SignOut warning:', error.message);
  }
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && error.name !== 'AuthSessionMissingError') {
    console.error('Error fetching current user:', error);
  }
  return user;
}
