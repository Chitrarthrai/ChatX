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
    const { meetingId, transcriptText } = await req.json();

    const summary = {
      meetingId,
      executiveSummary: "The team agreed on monorepo architecture, using Supabase PostgreSQL RLS policies for tenant isolation, and SFU WebRTC for multi-participant video calls.",
      actionItems: [
        { task: "Deploy Migration 00003 schema", assignedTo: "Alex Mercer", priority: "high" },
        { task: "Configure GitHub OAuth callback endpoints", assignedTo: "Dev Team", priority: "medium" },
      ],
      sentimentScore: 0.92,
      createdAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ success: true, summary }), {
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
