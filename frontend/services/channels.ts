import { createClient } from '@/lib/supabase/client';
import type { ChannelType } from '@chatx/types';

export interface ChannelItem {
  id: string;
  name: string;
  topic: string;
  type: ChannelType;
  locked: boolean;
}

export interface UserDirectoryItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: 'online' | 'away' | 'dnd' | 'offline';
}

export async function fetchChannels(): Promise<ChannelItem[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('id, name, topic, type, is_private')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      topic: c.topic || '',
      type: (c.type as ChannelType) || 'text',
      locked: c.is_private || false,
    }));
  } catch {
    return [];
  }
}

export async function createChannel(name: string, topic: string, type: ChannelType = 'text', isPrivate = false): Promise<ChannelItem> {
  const supabase = createClient();
  const { data: teamData } = await supabase.from('teams').select('id').limit(1).single();
  if (!teamData?.id) {
    throw new Error('No active workspace team found.');
  }

  const { data, error } = await supabase
    .from('channels')
    .insert({ team_id: teamData.id, name, topic, type, is_private: isPrivate })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    topic: data.topic || '',
    type: (data.type as ChannelType) || 'text',
    locked: data.is_private || false,
  };
}

export async function fetchProfilesDirectory(): Promise<UserDirectoryItem[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, email, status')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      return [];
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.full_name || p.username || 'Team Member',
      username: p.username || 'user',
      email: p.email || '',
      role: 'Member',
      status: p.status || 'online',
    }));
  } catch {
    return [];
  }
}
