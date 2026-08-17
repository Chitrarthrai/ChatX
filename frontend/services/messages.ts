import { createClient } from '@/lib/supabase/client';
import type { Message, Conversation } from '@chatx/types';
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
  const supabase = createClient();
  const { data: userConvs } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId);

  if (userConvs && userConvs.length > 0) {
    const convIds = userConvs.map((c) => c.conversation_id);
    const { data: sharedConvs } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversation:conversations(type)')
      .eq('user_id', targetUserId)
      .in('conversation_id', convIds);

    const direct = sharedConvs?.find((c: any) => c.conversation?.type === 'direct');
    if (direct?.conversation_id) {
      return direct.conversation_id;
    }
  }

  const { data: newConv, error: convErr } = await supabase
    .from('conversations')
    .insert({ type: 'direct' })
    .select()
    .single();

  if (convErr || !newConv) {
    throw new Error(convErr?.message || 'Failed to create direct conversation');
  }

  await supabase.from('conversation_members').insert([
    { conversation_id: newConv.id, user_id: userId },
    { conversation_id: newConv.id, user_id: targetUserId },
  ]);

  return newConv.id;
}

const messageMemoryCache = new Map<string, Message[]>();

export async function fetchMessages(conversationId: string, limit = 50): Promise<Message[]> {
  return fetchMessagesFromBackend(conversationId, limit);
}

async function fetchMessagesFromBackend(conversationId: string, limit = 50): Promise<Message[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
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
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error || !data || data.length === 0) return [];

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

    messageMemoryCache.set(conversationId, formatted);
    return formatted;
  } catch {
    return [];
  }
}

export async function sendMessage(input: CreateMessageInput, senderId: string): Promise<Message> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_id: senderId,
      content: input.content,
      type: input.type || 'text',
      thread_id: input.threadId,
      reply_to_id: input.replyToId,
      status: 'sent'
    })
    .select()
    .single();

  if (error || !data) {
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

export async function markMessageAsDelivered(messageId: string): Promise<void> {
  const supabase = createClient();
  try {
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

export async function markMessagesAsRead(conversationId: string, readerUserId: string): Promise<void> {
  const supabase = createClient();
  try {
    await supabase
      .from('messages')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', readerUserId)
      .neq('status', 'read');
  } catch (err: unknown) {
    console.warn('Read receipt warning:', (err as Error).message);
  }
}

export function subscribeToMessages(conversationId: string, onMessageEvent: (msg: Message) => void) {
  const supabase = createClient();
  return supabase
    .channel(`realtime:messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const msgData: any = payload.new || payload.old;
        if (msgData) {
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
          });
        }
      }
    )
    .subscribe();
}

export async function editMessage(messageId: string, content: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .update({ content, is_edited: true, updated_at: new Date().toISOString() })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMessage(messageId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('messages').delete().eq('id', messageId);
  if (error) throw new Error(error.message);
}

export async function togglePinMessage(messageId: string, isPinned: boolean) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .update({ is_pinned: isPinned })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
