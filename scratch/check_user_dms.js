const SUPABASE_URL = "https://bvvocllzbvrodjdgjyib.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo";

async function querySupabase(path, headers = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...headers
    }
  });
  return res.json();
}

async function verifyDatabaseChannelsAndDMs() {
  console.log(" Logging in with chitrarth.rai@neophyte.ai...");
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: "chitrarth.rai@neophyte.ai",
      password: "123*#*raisahab"
    })
  });

  const authData = await authRes.json();
  if (!authData.access_token) {
    console.error(" Authentication failed:", authData);
    return;
  }

  const token = authData.access_token;
  const userId = authData.user.id;
  const authHeader = { 'Authorization': `Bearer ${token}` };

  console.log("\n1. --- DB Channels ---");
  const channels = await querySupabase(`/rest/v1/channels?select=*`, authHeader);
  console.log(`Channels returned (${channels?.length || 0}):`);
  channels?.forEach(c => console.log(` - [${c.id}] #${c.name} (${c.topic})`));

  console.log("\n2. --- DB Profiles Directory ---");
  const profiles = await querySupabase(`/rest/v1/profiles?select=*`, authHeader);
  console.log(`Profiles returned (${profiles?.length || 0}):`);
  profiles?.forEach(p => console.log(` - [${p.id}] ${p.full_name || p.username} (${p.email}) - ${p.status}`));

  console.log("\n3. --- DB Messages in Channels ---");
  if (Array.isArray(channels)) {
    for (const c of channels) {
      const msgs = await querySupabase(`/rest/v1/messages?conversation_id=eq.${c.id}&select=*`, authHeader);
      console.log(` Channel #${c.name} has ${msgs?.length || 0} messages.`);
    }
  }
}

verifyDatabaseChannelsAndDMs();
