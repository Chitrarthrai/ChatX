import { createClient } from '@/lib/supabase/client';

export async function uploadAttachment(file: File, pathPrefix = 'chat-attachments'): Promise<{ url: string; path: string }> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${pathPrefix}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data: publicUrlData } = supabase.storage
    .from('attachments')
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
  };
}

export async function getSignedDownloadUrl(filePath: string, expiresInSeconds = 3600): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}
