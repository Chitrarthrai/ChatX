import { createClient } from '@/lib/supabase/client';
import type { Message } from '@chatx/types';

export function subscribeToConversation(
  conversationId: string,
  onNewMessage: (message: Message) => void
) {
  const supabase = createClient();
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const newMsg = payload.new;
        onNewMessage({
          id: newMsg.id,
          conversationId: newMsg.conversation_id,
          senderId: newMsg.sender_id,
          content: newMsg.content,
          type: newMsg.type,
          threadId: newMsg.thread_id,
          replyToId: newMsg.reply_to_id,
          isEdited: newMsg.is_edited,
          isPinned: newMsg.is_pinned,
          isLocked: newMsg.is_locked,
          createdAt: newMsg.created_at,
          updatedAt: newMsg.updated_at,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToPresence(
  roomName: string,
  userId: string,
  userInfo: { fullName: string; avatarUrl?: string },
  onSync: (presences: Record<string, any>) => void
) {
  const supabase = createClient();
  const channel = supabase.channel(`presence:${roomName}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      onSync(channel.presenceState());
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          onlineAt: new Date().toISOString(),
          ...userInfo,
        });
      }
    });

  return {
    broadcastTyping: (isTyping: boolean) => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping },
      });
    },
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
