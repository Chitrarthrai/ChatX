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

    if (error) {
      console.warn("fetchChannels error:", error.message);
      return [];
    }
    if (!data) return [];

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

    const { data: newTeam } = await supabase
      .from('teams')
      .insert({ organization_id: orgData?.id, name: 'General Workspace', description: 'Workspace main team', is_private: false })
      .select('id')
      .single();
    teamData = newTeam;
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

/**
 * Fetch DM contacts for the sidebar.
 *
 * 1. Query existing DM conversations the current user is part of
 *    (conversations.type = 'direct' via conversation_members).
 * 2. For each DM, resolve the *other* participant's profile.
 * 3. Merge in any remaining profiles from the directory so the user
 *    can start new DMs with people they haven't messaged yet.
 * 4. Exclude the current user from the list.
 */
export async function fetchDirectMessageContacts(currentUserId?: string): Promise<UserDirectoryItem[]> {
  const supabase = createClient();
  const contactMap = new Map<string, UserDirectoryItem>();

  try {
    if (currentUserId) {
      // Step 1: Find all conversations the current user belongs to
      const { data: myMemberships } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (myMemberships && myMemberships.length > 0) {
        const myConvIds = myMemberships.map((m) => m.conversation_id);

        // Step 2: Find which of those are 'direct' conversations
        const { data: directConvs } = await supabase
          .from('conversations')
          .select('id')
          .in('id', myConvIds)
          .eq('type', 'direct');

        if (directConvs && directConvs.length > 0) {
          const directConvIds = directConvs.map((c) => c.id);

          // Step 3: Find the other members in those direct conversations
          const { data: otherMembers } = await supabase
            .from('conversation_members')
            .select('user_id, conversation_id')
            .in('conversation_id', directConvIds)
            .neq('user_id', currentUserId);

          if (otherMembers && otherMembers.length > 0) {
            const otherUserIds = [...new Set(otherMembers.map((m) => m.user_id))];

            // Step 4: Fetch those users' profiles
            const { data: dmProfiles } = await supabase
              .from('profiles')
              .select('id, full_name, username, email, status')
              .in('id', otherUserIds);

            if (dmProfiles) {
              for (const p of dmProfiles) {
                contactMap.set(p.id, {
                  id: p.id,
                  name: p.full_name || p.username || p.email || 'Team Member',
                  username: p.username || 'user',
                  email: p.email || '',
                  role: 'Member',
                  status: (p.status as UserDirectoryItem['status']) || 'offline',
                });
              }
            }
          }
        }
      }
    }

    // Step 5: Merge in all profiles from directory (online, away, dnd, and offline)
    let profilesQuery = supabase
      .from('profiles')
      .select('id, full_name, username, email, status')
      .order('created_at', { ascending: false })
      .limit(50);

    if (currentUserId) {
      profilesQuery = profilesQuery.neq('id', currentUserId);
    }

    const { data: allProfiles } = await profilesQuery;

    if (allProfiles) {
      for (const p of allProfiles) {
        if (!contactMap.has(p.id)) {
          contactMap.set(p.id, {
            id: p.id,
            name: p.full_name || p.username || p.email || 'Team Member',
            username: p.username || 'user',
            email: p.email || '',
            role: 'Member',
            status: (p.status as UserDirectoryItem['status']) || 'offline',
          });
        }
      }
    }

    return Array.from(contactMap.values());
  } catch (err) {
    console.warn("fetchDirectMessageContacts error:", err);
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

