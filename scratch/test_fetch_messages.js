const SUPABASE_URL = "https://bvvocllzbvrodjdgjyib.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo";

async function testFetchAndInsertMessage() {
  console.log("1. Authenticating as chitrarth.rai@neophyte.ai...");
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
  const token = authData.access_token;
  const userId = authData.user.id;
  console.log(` Auth Token acquired for user: ${userId}`);

  const authHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log("\n2. Inserting message into #Architecture & Engineering channel...");
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
    method: 'POST',
    headers: { ...authHeaders, 'Prefer': 'return=representation' },
    body: JSON.stringify({
      conversation_id: 'acbf51eb-0217-4315-850f-300685484035',
      sender_id: userId,
      content: 'Realtime database test message sent from authenticated user session',
      type: 'text',
      status: 'sent'
    })
  });
  const inserted = await insertRes.json();
  console.log(" Inserted Message:", inserted);

  console.log("\n3. Fetching messages for #Architecture & Engineering channel...");
  const fetchRes = await fetch(`${SUPABASE_URL}/rest/v1/messages?conversation_id=eq.acbf51eb-0217-4315-850f-300685484035&order=created_at.asc`, {
    headers: authHeaders
  });
  const messages = await fetchRes.json();
  console.log(` Total Messages Fetched: ${messages?.length || 0}`);
  messages?.forEach(m => console.log(` - [${m.created_at}] ${m.content}`));
}

testFetchAndInsertMessage();
