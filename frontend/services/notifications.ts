import { createClient } from '@/lib/supabase/client';
import type { AppNotification } from '@chatx/types';

export type { AppNotification };

interface NotificationRow {
  id: string;
  user_id: string;
  type: any;
  title: string;
  body?: string;
  message?: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];

    return (data as NotificationRow[]).map((n) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      body: n.body || n.message || '',
      isRead: n.is_read,
      linkUrl: n.link_url,
      createdAt: n.created_at,
    }));
  } catch {
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const supabase = createClient();
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  } catch (err: unknown) {
    console.warn('Notification mark read notice:', (err as Error).message);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = createClient();
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
  } catch (err: unknown) {
    console.warn('Notification batch mark read notice:', (err as Error).message);
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createClient();
  try {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
  } catch (err: unknown) {
    console.warn('Notification deletion notice:', (err as Error).message);
  }
}

export function subscribeToNotifications(userId: string, onNewNotification: (notif: AppNotification) => void) {
  const supabase = createClient();
  return supabase
    .channel(`realtime:notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const n = payload.new;
        onNewNotification({
          id: n.id,
          userId: n.user_id,
          type: n.type,
          title: n.title,
          body: n.body || n.message,
          isRead: n.is_read,
          linkUrl: n.link_url,
          createdAt: n.created_at,
        });
      }
    )
    .subscribe();
}
