import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, types = ['messages', 'files', 'users'], limit = 20 } = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Unauthorized');

    const results: Record<string, any[]> = {};

    if (types.includes('messages')) {
      const { data: messages } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id, conversation_id')
        .ilike('content', `%${query}%`)
        .limit(limit);
      results.messages = messages ?? [];
    }

    if (types.includes('files')) {
      const { data: files } = await supabase
        .from('files')
        .select('id, name, file_type, file_url, created_at')
        .ilike('name', `%${query}%`)
        .limit(limit);
      results.files = files ?? [];
    }

    if (types.includes('users')) {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, username, email, avatar_url, status')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);
      results.users = users ?? [];
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
