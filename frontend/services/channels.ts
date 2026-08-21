import { createClient, supabaseRestFetch } from '@/lib/supabase/client';
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
  try {
    let data: any = await supabaseRestFetch('channels?select=id,name,topic,type,is_private&order=created_at.asc');
    if (!data) {
      const supabase = createClient();
      const res = await supabase.from('channels').select('id, name, topic, type, is_private').order('created_at', { ascending: true });
      data = res.data;
    }
    if (!data || !Array.isArray(data)) return [];

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      topic: c.topic || '',
      type: (c.type as ChannelType) || 'text',
      locked: c.is_private || false,
    }));
  } catch (err: any) {
    console.warn("fetchChannels catch:", err.message);
    return [];
  }
}

export async function createChannel(name: string, topic: string, type: ChannelType = 'text', isPrivate = false): Promise<ChannelItem> {
  const supabase = createClient();
  let { data: teamData } = await supabase.from('teams').select('id').limit(1).maybeSingle();
  
  if (!teamData?.id) {
    let { data: orgData } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
    if (!orgData?.id) {
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert({ name: 'ChatX Organization', slug: `chatx-org-${Date.now()}` })
        .select('id')
        .single();
      orgData = newOrg;
    }
    
    if (orgData?.id) {
      const { data: newTeam } = await supabase
        .from('teams')
        .insert({ organization_id: orgData.id, name: 'General Engineering', slug: `engineering-${Date.now()}` })
        .select('id')
        .single();
      teamData = newTeam;
    }
  }

  const payload: any = {
    name,
    topic,
    type,
    is_private: isPrivate,
  };
  
  if (teamData?.id) {
    payload.team_id = teamData.id;
  }

  const { data, error } = await supabase
    .from('channels')
    .insert(payload)
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

/**
 * Fetch DM contacts for the sidebar.
 * Queries user profiles from the organization directory.
 */
export async function fetchDirectMessageContacts(currentUserId?: string): Promise<UserDirectoryItem[]> {
  try {
    const filter = currentUserId ? `&id=neq.${currentUserId}` : '';
    let profiles: any = await supabaseRestFetch(`profiles?select=id,full_name,username,email,status,last_seen&order=created_at.desc&limit=50${filter}`);
    if (!profiles) {
      const supabase = createClient();
      let query = supabase.from('profiles').select('id, full_name, username, email, status, last_seen').order('created_at', { ascending: false }).limit(50);
      if (currentUserId) query = query.neq('id', currentUserId);
      const res = await query;
      profiles = res.data;
    }
    if (!profiles || !Array.isArray(profiles)) return [];

    return profiles.map((p: any) => {
      let resolvedStatus: UserDirectoryItem['status'] = (p.status as UserDirectoryItem['status']) || 'online';
      if (p.status === 'dnd') {
        resolvedStatus = 'dnd';
      } else if (p.status === 'offline') {
        resolvedStatus = 'offline';
      } else {
        resolvedStatus = 'online';
      }

      return {
        id: p.id,
        name: p.full_name || p.username || p.email || 'Team Member',
        username: p.username || 'user',
        email: p.email || '',
        role: 'Member',
        status: resolvedStatus,
      };
    });
  } catch (err: any) {
    console.warn("fetchDirectMessageContacts catch:", err.message);
    return [];
  }
}

/** @deprecated Use fetchDirectMessageContacts instead */
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
      name: p.full_name || p.username || p.email || 'Team Member',
      username: p.username || 'user',
      email: p.email || '',
      role: 'Member',
      status: p.status || 'online',
    }));
  } catch {
    return [];
  }
}

