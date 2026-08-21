import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://bvvocllzbvrodjdgjyib.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

let client: ReturnType<typeof createSupabaseClient<any>> | undefined;

export function createClient() {
  if (!client) {
    client = createSupabaseClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export async function supabaseRestFetch<T = any>(endpoint: string): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/${endpoint}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
