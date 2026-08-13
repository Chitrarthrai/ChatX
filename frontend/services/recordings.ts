import { createClient } from '@/lib/supabase/client';

export interface MeetingRecordingItem {
  id: string;
  meetingTitle: string;
  meetingCode: string;
  hostName: string;
  duration: string;
  fileSize: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  isFavorite: boolean;
}

export async function fetchRecordings(): Promise<MeetingRecordingItem[]> {
  try {
    const supabase = createClient();
    const queryPromise = supabase
      .from('meeting_recordings')
      .select('*, meeting:meetings(*), owner:profiles(full_name, email)')
      .order('created_at', { ascending: false });

    const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 2500)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (!error && data && data.length > 0) {
      return data.map((rec: any) => ({
        id: rec.id,
        meetingTitle: rec.title || rec.meeting?.title || "Live Meeting Session",
        meetingCode: rec.meeting?.meeting_code || "chatx-room",
        hostName: rec.owner?.full_name || "Team Host",
        duration: `${Math.floor((rec.duration_seconds || 1800) / 60)}m ${(rec.duration_seconds || 1800) % 60}s`,
        fileSize: `${((rec.file_size_bytes || 200000000) / 1024 / 1024).toFixed(0)} MB`,
        videoUrl: rec.video_url || rec.file_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        createdAt: rec.created_at,
        isFavorite: false,
      }));
    }
  } catch {
    /* Return empty list */
  }

  return [];
}
