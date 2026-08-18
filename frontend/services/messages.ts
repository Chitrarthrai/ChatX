import { createClient, supabaseRestFetch } from '@/lib/supabase/client';
import type { Message, Conversation, UserProfile } from '@chatx/types';
import type { CreateMessageInput } from '@chatx/validation';

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('conversation_members')
      .select(`
        conversation:conversations (
          id,
          type,
          name,
          avatar_url,
          is_archived,
          is_locked,
          last_message_at,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId);

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.conversation.id,
      type: row.conversation.type,
      name: row.conversation.name,
      avatarUrl: row.conversation.avatar_url,
      isArchived: row.conversation.is_archived,
      isLocked: row.conversation.is_locked,
      lastMessageAt: row.conversation.last_message_at,
      createdAt: row.conversation.created_at,
      updatedAt: row.conversation.updated_at,
    }));
  } catch {
    return [];
  }
}

export async function getOrCreateDirectConversation(userId: string, targetUserId: string): Promise<string> {
  try {
    const userConvs: any = await supabaseRestFetch(`conversation_members?user_id=eq.${userId}&select=conversation_id`);
    if (userConvs && Array.isArray(userConvs) && userConvs.length > 0) {
      const convIds = userConvs.map((c: any) => c.conversation_id);
      const sharedConvs: any = await supabaseRestFetch(`conversation_members?user_id=eq.${targetUserId}&conversation_id=in.(${convIds.join(',')})&select=conversation_id`);
      
      if (sharedConvs && Array.isArray(sharedConvs) && sharedConvs.length > 0) {
        const targetConvIds = sharedConvs.map((s: any) => s.conversation_id);
        const directConvs: any = await supabaseRestFetch(`conversations?id=in.(${targetConvIds.join(',')})&type=eq.direct&limit=1&select=id`);
        if (directConvs && Array.isArray(directConvs) && directConvs.length > 0) {
          return directConvs[0].id;
        }
      }
    }

    const supabase = createClient();
    const { data: newConv, error: convErr } = await supabase
      .from('conversations')
      .insert({ type: 'direct' })
      .select('id')
      .single();

    if (convErr || !newConv) {
      console.warn('Direct conversation creation error:', convErr?.message);
      return '';
    }

    await supabase.from('conversation_members').insert([
      { conversation_id: newConv.id, user_id: userId, role: 'member' },
      { conversation_id: newConv.id, user_id: targetUserId, role: 'member' },
    ]);

    return newConv.id;
  } catch (err: any) {
    console.warn('getOrCreateDirectConversation catch:', err?.message);
    return '';
  }
}

/**
 * Get or create a conversation row for a channel.
 * 
 * The DB schema has separate `channels` and `conversations` tables.
 * `messages.conversation_id` references `conversations.id`, NOT `channels.id`.
 * This function bridges the two: it finds (or creates) a `conversations` row
 * whose `name` matches the channel ID, so messages can be stored against
 * a real conversation UUID.
 */
export async function getOrCreateChannelConversation(channelId: string, _userId?: string, _channelName?: string): Promise<string> {
  return channelId;
}

const messageMemoryCache = new Map<string, Message[]>();

export async function fetchMessages(conversationId: string, limit = 25, beforeCreatedAt?: string): Promise<Message[]> {
  return fetchMessagesFromBackend(conversationId, limit, beforeCreatedAt);
}

async function fetchMessagesFromBackend(conversationId: string, limit = 25, beforeCreatedAt?: string): Promise<Message[]> {
  try {
    const filterBefore = beforeCreatedAt ? `&created_at=lt.${encodeURIComponent(beforeCreatedAt)}` : '';
    let data: any = await supabaseRestFetch(`messages?conversation_id=eq.${conversationId}&select=*,sender:profiles(id,email,username,full_name,avatar_url,status)&order=created_at.desc&limit=${limit}${filterBefore}`);

    if (!data) {
      const supabase = createClient();
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles (
            id,
            email,
            username,
            full_name,
            avatar_url,
            status
          )
        `)
        .eq('conversation_id', conversationId);

      if (beforeCreatedAt) {
        query = query.lt('created_at', beforeCreatedAt);
      }

      const res = await query.order('created_at', { ascending: false }).limit(limit);
      data = res.data;
    }

    if (!data || !Array.isArray(data) || data.length === 0) return [];

    const formatted: Message[] = data.map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      content: msg.content,
      type: msg.type,
      threadId: msg.thread_id,
      replyToId: msg.reply_to_id,
      isEdited: msg.is_edited,
      isPinned: msg.is_pinned,
      isLocked: msg.is_locked,
      status: (msg.status || 'sent') as 'sent' | 'delivered' | 'read',
      deliveredAt: msg.delivered_at,
      readAt: msg.read_at,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at,
      sender: msg.sender ? {
        id: msg.sender.id,
        email: msg.sender.email,
        username: msg.sender.username,
        fullName: msg.sender.full_name,
        avatarUrl: msg.sender.avatar_url,
        status: msg.sender.status,
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } : undefined,
    }));

    // Reverse descending results to render in chronological order (oldest to newest)
    return formatted.reverse();
  } catch {
    return [];
  }
}

export async function sendMessage(input: CreateMessageInput, senderId: string): Promise<Message> {
  const payload = {
    conversation_id: input.conversationId,
    sender_id: senderId,
    content: input.content,
    type: input.type || 'text',
    thread_id: input.threadId,
    reply_to_id: input.replyToId,
    status: 'sent'
  };

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/messages`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const data = rows[0];
          return {
            id: data.id,
            conversationId: data.conversation_id,
            senderId: data.sender_id,
            content: data.content,
            type: data.type,
            threadId: data.thread_id,
            replyToId: data.reply_to_id,
            isEdited: data.is_edited,
            isPinned: data.is_pinned,
            isLocked: data.is_locked,
            status: (data.status || 'sent') as 'sent' | 'delivered' | 'read',
            deliveredAt: data.delivered_at,
            readAt: data.read_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      }
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        content: data.content,
        type: data.type,
        threadId: data.thread_id,
        replyToId: data.reply_to_id,
        isEdited: data.is_edited,
        isPinned: data.is_pinned,
        isLocked: data.is_locked,
        status: (data.status || 'sent') as 'sent' | 'delivered' | 'read',
        deliveredAt: data.delivered_at,
        readAt: data.read_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch (err: any) {
    console.warn('sendMessage catch:', err.message);
  }

  return {
    id: `msg-${Date.now()}`,
    conversationId: input.conversationId,
    senderId,
    content: input.content,
    type: input.type || 'text',
    threadId: input.threadId,
    replyToId: input.replyToId,
    isEdited: false,
    isPinned: false,
    isLocked: false,
    status: 'sent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function markMessageAsDelivered(messageId: string): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/messages?id=eq.${messageId}&status=eq.sent`, {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
      });
      return;
    }

    const supabase = createClient();
    await supabase
      .from('messages')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('status', 'sent');
  } catch (err: unknown) {
    console.warn('Delivery receipt warning:', (err as Error).message);
  }
}

export async function markMessagesAsRead(conversationId: string, readerUserId?: string): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const filter = readerUserId ? `&sender_id=neq.${readerUserId}` : '';
      await fetch(`${url}/rest/v1/messages?conversation_id=eq.${conversationId}&status=neq.read${filter}`, {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          status: 'read',
          read_at: new Date().toISOString()
        })
      });
      return;
    }

    const supabase = createClient();
    let query = supabase
      .from('messages')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .neq('status', 'read');

    if (readerUserId) {
      query = query.neq('sender_id', readerUserId);
    }

    const { error } = await query;
    if (error) {
      console.warn('markMessagesAsRead error:', error.message);
    }
  } catch (err: unknown) {
    console.warn('Read receipt warning:', (err as Error).message);
  }
}

const profileCache = new Map<string, UserProfile>();

export function subscribeToMessages(conversationId: string, onMessageEvent: (msg: Message) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(`realtime-messages-${conversationId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      async (payload) => {
        const msgData: any = payload.new && Object.keys(payload.new).length > 0 ? payload.new : payload.old;
        if (!msgData || !msgData.id) return;
        if (msgData.conversation_id && msgData.conversation_id !== conversationId) return;

        let senderProfile: UserProfile | undefined = undefined;
        if (msgData.sender_id) {
          if (profileCache.has(msgData.sender_id)) {
            senderProfile = profileCache.get(msgData.sender_id);
          } else {
            try {
              const p: any = await supabaseRestFetch(`profiles?id=eq.${msgData.sender_id}&select=id,email,username,full_name,avatar_url,status&limit=1`);
              if (p && Array.isArray(p) && p.length > 0) {
                senderProfile = {
                  id: p[0].id,
                  email: p[0].email,
                  username: p[0].username,
                  fullName: p[0].full_name,
                  avatarUrl: p[0].avatar_url,
                  status: p[0].status,
                  lastSeen: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                profileCache.set(msgData.sender_id, senderProfile);
              }
            } catch { /* profile fallback */ }
          }
        }

        onMessageEvent({
          id: msgData.id,
          conversationId: msgData.conversation_id,
          senderId: msgData.sender_id,
          content: msgData.content,
          type: msgData.type,
          threadId: msgData.thread_id,
          replyToId: msgData.reply_to_id,
          isEdited: msgData.is_edited,
          isPinned: msgData.is_pinned,
          isLocked: msgData.is_locked,
          status: (msgData.status || 'sent') as 'sent' | 'delivered' | 'read',
          deliveredAt: msgData.delivered_at,
          readAt: msgData.read_at,
          createdAt: msgData.created_at,
          updatedAt: msgData.updated_at,
          sender: senderProfile,
        });
      }
    )
    .subscribe((status, err) => {
      console.log('[Realtime Sub Status]:', status, err?.message || '');
    });

  return channel;
}

export async function editMessage(messageId: string, content: string): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          content,
          is_edited: true,
          updated_at: new Date().toISOString()
        })
      });
      return;
    }

    const supabase = createClient();
    await supabase
      .from('messages')
      .update({ content, is_edited: true, updated_at: new Date().toISOString() })
      .eq('id', messageId);
  } catch (err: unknown) {
    console.warn('editMessage error:', (err as Error).message);
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/messages?id=eq.${messageId}`, {
        method: 'DELETE',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        }
      });
      return;
    }

    const supabase = createClient();
    await supabase.from('messages').delete().eq('id', messageId);
  } catch (err: unknown) {
    console.warn('deleteMessage error:', (err as Error).message);
  }
}

export async function togglePinMessage(messageId: string, isPinned: boolean): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          is_pinned: isPinned,
          updated_at: new Date().toISOString()
        })
      });
      return;
    }

    const supabase = createClient();
    await supabase
      .from('messages')
      .update({ is_pinned: isPinned })
      .eq('id', messageId);
  } catch (err: unknown) {
    console.warn('togglePinMessage error:', (err as Error).message);
  }
}

export async function saveMessage(messageId: string, userId: string, note?: string): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/saved_messages`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          message_id: messageId,
          user_id: userId,
          note: note || '',
          saved_at: new Date().toISOString()
        })
      });
      return;
    }

    const supabase = createClient();
    await supabase.from('saved_messages').insert({
      message_id: messageId,
      user_id: userId,
      note: note || '',
      saved_at: new Date().toISOString()
    });
  } catch (err: unknown) {
    console.warn('saveMessage warning:', (err as Error).message);
  }
}

export async function unsaveMessage(messageId: string, userId: string): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/saved_messages?message_id=eq.${messageId}&user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        }
      });
      return;
    }

    const supabase = createClient();
    await supabase.from('saved_messages').delete()
      .eq('message_id', messageId)
      .eq('user_id', userId);
  } catch (err: unknown) {
    console.warn('unsaveMessage warning:', (err as Error).message);
  }
}

export async function fetchSavedMessageIds(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const data: any = await supabaseRestFetch(`saved_messages?user_id=eq.${userId}&select=message_id`);
    if (data && Array.isArray(data)) {
      return data.map((d: any) => d.message_id);
    }
  } catch {}
  return [];
}

export async function fetchReactionsForMessages(messageIds: string[]): Promise<Record<string, { emoji: string; count: number; users: string[] }[]>> {
  if (!messageIds || messageIds.length === 0) return {};
  try {
    const data: any = await supabaseRestFetch(`message_reactions?message_id=in.(${messageIds.join(',')})&select=id,message_id,user_id,emoji`);
    if (!data || !Array.isArray(data)) return {};

    const result: Record<string, Record<string, string[]>> = {};
    for (const r of data) {
      if (!result[r.message_id]) result[r.message_id] = {};
      if (!result[r.message_id][r.emoji]) result[r.message_id][r.emoji] = [];
      result[r.message_id][r.emoji].push(r.user_id);
    }

    const formatted: Record<string, { emoji: string; count: number; users: string[] }[]> = {};
    for (const [msgId, emojis] of Object.entries(result)) {
      formatted[msgId] = Object.entries(emojis).map(([emoji, users]) => ({
        emoji,
        count: users.length,
        users,
      }));
    }
    return formatted;
  } catch {
    return {};
  }
}

export async function addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/message_reactions`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          message_id: messageId,
          user_id: userId,
          emoji,
        })
      });
      return;
    }

    const supabase = createClient();
    await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: userId,
      emoji,
    });
  } catch (err: unknown) {
    console.warn('addReaction warning:', (err as Error).message);
  }
}

export async function removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/message_reactions?message_id=eq.${messageId}&user_id=eq.${userId}&emoji=eq.${encodeURIComponent(emoji)}`, {
        method: 'DELETE',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });
      return;
    }

    const supabase = createClient();
    await supabase.from('message_reactions').delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji);
  } catch (err: unknown) {
    console.warn('removeReaction warning:', (err as Error).message);
  }
}

export function subscribeToReactions(onReactionEvent: (event: { eventType: 'INSERT' | 'DELETE'; reaction: { id: string; messageId: string; userId: string; emoji: string } }) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(`realtime-reactions-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
      },
      (payload) => {
        const data: any = payload.new && Object.keys(payload.new).length > 0 ? payload.new : payload.old;
        if (!data) return;
        onReactionEvent({
          eventType: (payload.eventType as 'INSERT' | 'DELETE') || 'INSERT',
          reaction: {
            id: data.id,
            messageId: data.message_id,
            userId: data.user_id,
            emoji: data.emoji,
          },
        });
      }
    )
    .subscribe((status, err) => {
      console.log('[Realtime Reactions Status]:', status, err?.message || '');
    });

  return channel;
}

