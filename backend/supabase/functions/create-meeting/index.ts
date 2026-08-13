import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, isHost, scheduledFor } = await req.json();

    const meetingId = crypto.randomUUID();
    const meetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomName = `chatx-room-${meetingCode.toLowerCase()}`;

    const meetingData = {
      id: meetingId,
      title: title || 'Instant Video Meeting',
      meeting_code: meetingCode,
      room_name: roomName,
      status: 'active',
      is_host: isHost || true,
      created_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ success: true, data: meetingData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
