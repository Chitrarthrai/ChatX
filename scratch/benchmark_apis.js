const SUPABASE_URL = "https://bvvocllzbvrodjdgjyib.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

async function benchmarkEndpoints() {
  console.log("⏱️ Benchmarking All ChatX API Endpoints Response Times...\n");

  const endpoints = [
    { name: "1. Profiles Directory (/rest/v1/profiles)", url: `${SUPABASE_URL}/rest/v1/profiles?select=*` },
    { name: "2. Messages Feed (/rest/v1/messages)", url: `${SUPABASE_URL}/rest/v1/messages?select=*&limit=50` },
    { name: "3. Direct Message Conversations (/rest/v1/conversations)", url: `${SUPABASE_URL}/rest/v1/conversations?select=*` },
    { name: "4. Organization Members (/rest/v1/organization_members)", url: `${SUPABASE_URL}/rest/v1/organization_members?select=*` },
    { name: "5. Enterprise Files (/rest/v1/files)", url: `${SUPABASE_URL}/rest/v1/files?select=*` },
    { name: "6. Scheduled Meetings (/rest/v1/meetings)", url: `${SUPABASE_URL}/rest/v1/meetings?select=*` },
  ];

  for (const ep of endpoints) {
    const start = performance.now();
    try {
      const res = await fetch(ep.url, { headers });
      await res.json();
      const end = performance.now();
      const durationMs = (end - start).toFixed(2);
      const statusIcon = durationMs < 1000 ? "⚡ EXCELLENT" : "⚠️ SLOW";
      console.log(`${ep.name}`);
      console.log(`   ⏱️ Time: ${durationMs} ms (${(durationMs / 1000).toFixed(2)}s) -> [Status: ${res.status}] [${statusIcon}]\n`);
    } catch (err) {
      console.log(`❌ Endpoint Error: ${ep.name} - ${err.message}\n`);
    }
  }
}

benchmarkEndpoints();
