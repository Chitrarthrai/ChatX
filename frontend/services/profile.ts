import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserStatus } from '@chatx/types';
import type { UpdateProfileInput } from '@chatx/validation';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Record not found
    throw new Error(error.message);
  }

  return {
    id: data.id,
    email: data.email,
    username: data.username,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    phone: data.phone,
    timezone: data.timezone,
    language: data.language,
    status: data.status as UserStatus,
    customStatus: data.custom_status,
    lastSeen: data.last_seen,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName,
      bio: input.bio,
      phone: input.phone,
      timezone: input.timezone,
      language: input.language,
      status: input.status,
      custom_status: input.customStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export async function setPresenceStatus(userId: string, status: UserStatus, customStatus?: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      status,
      custom_status: customStatus,
      last_seen: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}
