import { createClient, supabaseRestFetch } from '@/lib/supabase/client';
import { sendMessage, getOrCreateDirectConversation } from '@/services/messages';

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatMeetingTime(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return '';
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const timeStr = `${String(displayH).padStart(2, '0')}:${m} ${period}`;
  const dateFormatted = `${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  return `${timeStr} • ${dateFormatted}`;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
}

export interface MeetingItem {
  id: string;
  title: string;
  description?: string;
  hostName: string;
  hostAvatar?: string;
  hostEmail?: string;
  scheduledStart: string;
  timeFormatted: string;
  durationFormatted: string;
  meetingCode: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  isWaitingRoom: boolean;
  isRecording: boolean;
  participants: MeetingParticipant[];
  invitedGroups: string[];
}

export async function fetchMeetings(): Promise<MeetingItem[]> {
  try {
    const rawMeetings: any = await supabaseRestFetch(
      'meetings?select=id,title,description,meeting_code,status,is_waiting_room_enabled,is_recording_enabled,scheduled_start,created_at,host_id&order=scheduled_start.asc'
    );

    if (!rawMeetings || !Array.isArray(rawMeetings)) return [];

    const hostIds = Array.from(new Set(rawMeetings.map((m: any) => m.host_id).filter(Boolean)));
    const meetingIds = rawMeetings.map((m: any) => m.id);

    let hostMap = new Map<string, any>();
    if (hostIds.length > 0) {
      const profs: any = await supabaseRestFetch(
        `profiles?id=in.(${hostIds.join(',')})&select=id,full_name,email,avatar_url`
      );
      if (profs && Array.isArray(profs)) {
        for (const p of profs) hostMap.set(p.id, p);
      }
    }

    let participantsByMeeting = new Map<string, MeetingParticipant[]>();
    if (meetingIds.length > 0) {
      const parts: any = await supabaseRestFetch(
        `meeting_participants?meeting_id=in.(${meetingIds.join(',')})&select=id,meeting_id,user_id,role`
      );
      if (parts && Array.isArray(parts) && parts.length > 0) {
        const participantUserIds = Array.from(new Set(parts.map((p: any) => p.user_id).filter(Boolean)));
        let partUserMap = new Map<string, any>();
        if (participantUserIds.length > 0) {
          const partProfs: any = await supabaseRestFetch(
            `profiles?id=in.(${participantUserIds.join(',')})&select=id,full_name,email,avatar_url,status`
          );
          if (partProfs && Array.isArray(partProfs)) {
            for (const pr of partProfs) partUserMap.set(pr.id, pr);
          }
        }

        for (const pt of parts) {
          const u = partUserMap.get(pt.user_id);
          const item: MeetingParticipant = {
            id: pt.id,
            meetingId: pt.meeting_id,
            userId: pt.user_id,
            role: pt.role || 'attendee',
            name: u?.full_name || u?.email || 'Invited Member',
            email: u?.email || '',
            avatar: u?.avatar_url || (u?.full_name || 'U').charAt(0).toUpperCase(),
            status: u?.status || 'offline',
          };
          const list = participantsByMeeting.get(pt.meeting_id) || [];
          list.push(item);
          participantsByMeeting.set(pt.meeting_id, list);
        }
      }
    }

    return rawMeetings.map((m: any) => {
      const host = hostMap.get(m.host_id);
      const hostName = host?.full_name || host?.email || 'Team Member';
      const startDate = m.scheduled_start ? new Date(m.scheduled_start) : new Date(m.created_at || Date.now());

      return {
        id: m.id,
        title: m.title || 'Untitled Meeting',
        description: m.description,
        hostName: hostName,
        hostAvatar: host?.avatar_url || hostName.charAt(0).toUpperCase(),
        hostEmail: host?.email,
        scheduledStart: startDate.toISOString(),
        timeFormatted: formatMeetingTime(startDate),
        durationFormatted: '45 mins',
        meetingCode: m.meeting_code || `chatx-${m.id.substring(0, 6)}`,
        status: m.status || 'scheduled',
        isWaitingRoom: m.is_waiting_room_enabled ?? true,
        isRecording: m.is_recording_enabled ?? true,
        participants: participantsByMeeting.get(m.id) || [],
        invitedGroups: ['# Architecture & Engineering'],
      };
    });
  } catch (err: unknown) {
    console.warn('fetchMeetings catch:', (err as Error).message);
    return [];
  }
}

export interface ScheduleMeetingInput {
  title: string;
  description?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isWaitingRoom: boolean;
  isRecording: boolean;
  hostId: string;
  hostName?: string;
  inviteeUserIds?: string[];
  inviteeGroupNames?: string[];
  targetConversationId?: string;
}

export async function scheduleMeeting(input: ScheduleMeetingInput): Promise<MeetingItem> {
  const uniqueCode = `chatx-${Math.random().toString(36).substring(2, 8)}`;
  const startDateTime =
    input.scheduledDate && input.scheduledTime
      ? new Date(`${input.scheduledDate}T${input.scheduledTime}`).toISOString()
      : new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const meetingPayload = {
    title: input.title,
    description: input.description || '',
    host_id: input.hostId,
    meeting_code: uniqueCode,
    scheduled_start: startDateTime,
    is_waiting_room_enabled: input.isWaitingRoom,
    is_recording_enabled: input.isRecording,
    status: 'scheduled',
  };

  let insertedMeeting: any = null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    const res = await fetch(`${url}/rest/v1/meetings`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(meetingPayload),
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        insertedMeeting = rows[0];
      }
    }
  }

  if (!insertedMeeting) {
    const supabase = createClient();
    const { data, error } = await supabase.from('meetings').insert(meetingPayload).select().single();
    if (error) throw new Error(error.message);
    insertedMeeting = data;
  }

  const meetingId = insertedMeeting.id;

  // Insert participants if any
  const participantsList: MeetingParticipant[] = [];
  if (input.inviteeUserIds && input.inviteeUserIds.length > 0) {
    const participantRows = input.inviteeUserIds.map((uid) => ({
      meeting_id: meetingId,
      user_id: uid,
      role: 'attendee',
    }));

    try {
      if (url && key) {
        await fetch(`${url}/rest/v1/meeting_participants`, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(participantRows),
        });
      } else {
        const supabase = createClient();
        await supabase.from('meeting_participants').insert(participantRows);
      }
    } catch (pErr) {
      console.warn('Meeting participant insert warning:', pErr);
    }
  }

  // Real-time broadcast / announcement message into conversation
  const formattedDate = new Date(startDateTime).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const invitedListStr = [
    ...(input.inviteeGroupNames || []),
    ...(input.inviteeUserIds && input.inviteeUserIds.length > 0 ? [`${input.inviteeUserIds.length} Team Members`] : []),
  ].join(', ') || 'All Team Members';

  const announcementMessage = `📅 **Scheduled Video Meeting**: ${input.title}\n🕒 **Time**: ${formattedDate} (45 mins)\n👥 **Invited**: ${invitedListStr}\n🔑 **Meeting Code**: \`${uniqueCode}\`\n👉 **Join Stage**: http://localhost:3000/?meetingCode=${uniqueCode}`;

  // 1. Send personalized scheduled meeting invite card to each invited coworker's personal DM chat
  if (input.hostId && input.inviteeUserIds && input.inviteeUserIds.length > 0) {
    for (const inviteeId of input.inviteeUserIds) {
      if (inviteeId === input.hostId) continue;
      try {
        const dmConvId = await getOrCreateDirectConversation(input.hostId, inviteeId);
        if (dmConvId) {
          const directInviteMessage = `📅 **Scheduled Video Meeting**: ${input.title}\n🕒 **Time**: ${formattedDate} (45 mins)\n👥 **Invited**: Personal 1-on-1 Meeting Invite from ${input.hostName || 'Host'}\n🔑 **Meeting Code**: \`${uniqueCode}\`\n👉 **Join Stage**: http://localhost:3000/?meetingCode=${uniqueCode}`;
          await sendMessage({ conversationId: dmConvId, content: directInviteMessage, type: 'text' }, input.hostId);
        }
      } catch (dmErr) {
        console.warn('Personal chat meeting invite error:', dmErr);
      }
    }
  }

  // 2. Broadcast to selected channel if enabled
  if (input.targetConversationId && input.hostId) {
    try {
      await sendMessage({ conversationId: input.targetConversationId, content: announcementMessage, type: 'text' }, input.hostId);
    } catch (msgErr) {
      console.warn('Meeting announcement message warning:', msgErr);
    }
  }

  return {
    id: meetingId,
    title: input.title,
    description: input.description,
    hostName: input.hostName || 'You (Host)',
    hostAvatar: (input.hostName || 'Y').charAt(0).toUpperCase(),
    scheduledStart: startDateTime,
    timeFormatted: formatMeetingTime(startDateTime),
    durationFormatted: '45 mins',
    meetingCode: uniqueCode,
    status: 'scheduled',
    isWaitingRoom: input.isWaitingRoom,
    isRecording: input.isRecording,
    participants: participantsList,
    invitedGroups: input.inviteeGroupNames || ['# Architecture & Engineering'],
  };
}

export async function addMeetingParticipants(
  meetingId: string,
  meetingTitle: string,
  meetingCode: string,
  userIds: string[],
  groupNames: string[] = [],
  targetConversationId?: string,
  callerUserId?: string
): Promise<void> {
  if (userIds.length > 0) {
    const rows = userIds.map((uid) => ({
      meeting_id: meetingId,
      user_id: uid,
      role: 'attendee',
    }));

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/meeting_participants`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rows),
      });
    } else {
      const supabase = createClient();
      await supabase.from('meeting_participants').insert(rows);
    }

    // Send direct personal DM invite to newly added users
    if (callerUserId) {
      for (const uid of userIds) {
        if (uid === callerUserId) continue;
        try {
          const dmConvId = await getOrCreateDirectConversation(callerUserId, uid);
          if (dmConvId) {
            const directAddMsg = `📅 **Scheduled Video Meeting Invite**: **${meetingTitle}**\n👥 **Invited**: You have been added to this scheduled session\n🔑 **Meeting Code**: \`${meetingCode}\`\n👉 **Join Stage**: http://localhost:3000/?meetingCode=${meetingCode}`;
            await sendMessage({ conversationId: dmConvId, content: directAddMsg, type: 'text' }, callerUserId);
          }
        } catch (dmErr) {
          console.warn('Personal chat add invite error:', dmErr);
        }
      }
    }
  }

  // Post update message in real time to channel if enabled
  if (targetConversationId && callerUserId) {
    const names = [...groupNames, `${userIds.length} new member(s)`].join(', ');
    const updateMsg = `👥 **Meeting Invites Updated**: Added ${names} to **${meetingTitle}**\n🔑 **Code**: \`${meetingCode}\`\n👉 **Join**: http://localhost:3000/?meetingCode=${meetingCode}`;
    await sendMessage({ conversationId: targetConversationId, content: updateMsg, type: 'text' }, callerUserId);
  }
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    await fetch(`${url}/rest/v1/meeting_participants?meeting_id=eq.${meetingId}`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    await fetch(`${url}/rest/v1/meetings?id=eq.${meetingId}`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return;
  }

  const supabase = createClient();
  await supabase.from('meeting_participants').delete().eq('meeting_id', meetingId);
  await supabase.from('meetings').delete().eq('id', meetingId);
}

export function subscribeToMeetings(onMeetingEvent: () => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(`realtime-meetings-${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => {
      onMeetingEvent();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'meeting_participants' }, () => {
      onMeetingEvent();
    })
    .subscribe();

  return channel;
}
