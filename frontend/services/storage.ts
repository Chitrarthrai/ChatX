import { createClient } from '@/lib/supabase/client';

export async function uploadAttachment(file: File, pathPrefix = 'chat-attachments'): Promise<{ url: string; path: string }> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${cleanName}`;
  const filePath = `${pathPrefix}/${fileName}`;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    if (url && key) {
      const res = await fetch(`${url}/storage/v1/object/attachments/${filePath}`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'x-upsert': 'true',
        },
        body: file,
      });

      if (res.ok) {
        return {
          url: `${url}/storage/v1/object/public/attachments/${filePath}`,
          path: filePath,
        };
      }
    }

    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
      };
    }
  } catch (err: any) {
    console.warn('Storage upload error:', err.message);
  }

  const fallbackUrl = url ? `${url}/storage/v1/object/public/attachments/${filePath}` : '';
  return {
    url: fallbackUrl,
    path: filePath,
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


