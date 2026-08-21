import { createClient } from '@/lib/supabase/client';
import type { Organization, Team, Channel, ChannelType } from '@chatx/types';
import type { CreateChannelInput } from '@chatx/validation';

export async function createOrganization(name: string, slug: string): Promise<Organization> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, slug })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logo_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createTeam(
  organizationId: string,
  name: string,
  description?: string,
  isPrivate = false
): Promise<Team> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('teams')
    .insert({
      organization_id: organizationId,
      name,
      description,
      is_private: isPrivate,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    organizationId: data.organization_id,
    name: data.name,
    description: data.description,
    isPrivate: data.is_private,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createChannel(input: CreateChannelInput): Promise<Channel> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('channels')
    .insert({
      team_id: input.teamId,
      name: input.name,
      topic: input.topic,
      type: input.type || 'text',
      is_private: input.isPrivate || false,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    teamId: data.team_id,
    name: data.name,
    topic: data.topic,
    type: data.type as ChannelType,
    isPrivate: data.is_private,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function fetchTeamChannels(teamId: string): Promise<Channel[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((c: any) => ({
    id: c.id,
    teamId: c.team_id,
    name: c.name,
    topic: c.topic,
    type: c.type as ChannelType,
    isPrivate: c.is_private,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));
}

export async function fetchOrganizationTeams(): Promise<Team[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('fetchOrganizationTeams error:', error.message);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    organizationId: t.organization_id,
    name: t.name,
    description: t.description || '',
    isPrivate: t.is_private || false,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));
}

export async function fetchTeamMembers(teamId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*, profiles:user_id(*)')
    .eq('team_id', teamId);

  if (error) {
    console.warn('fetchTeamMembers error:', error.message);
    return [];
  }
  return data || [];
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: 'admin' | 'moderator' | 'member') {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .match({ team_id: teamId, user_id: userId })
    .select();

  if (error) throw new Error(error.message);
  return data;
}

export async function removeTeamMember(teamId: string, userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('team_members')
    .delete()
    .match({ team_id: teamId, user_id: userId });

  if (error) throw new Error(error.message);
  return true;
}

