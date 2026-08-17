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

async function checkFilesAndAttachments() {
  console.log(" Logging in as chitrarth.rai@neophyte.ai...");
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
  const authHeader = { 'Authorization': `Bearer ${token}` };

  console.log("\n1. --- Querying public.files Table ---");
  const files = await querySupabase(`/rest/v1/files?select=*,uploader:profiles(*)`, authHeader);
  console.log(`Total files found: ${files?.length || 0}`);
  if (Array.isArray(files) && files.length > 0) {
    files.forEach(f => {
      console.log(` - ID: ${f.id} | Name: ${f.name} | Size: ${f.file_size} bytes | Uploader: ${f.uploader?.email || f.uploader_id}`);
    });
  } else {
    console.log(" (No rows found in public.files table)");
  }

  console.log("\n2. --- Querying File/Document Messages in Chat ---");
  const docMsgs = await querySupabase(`/rest/v1/messages?or=(type.eq.document,content.ilike.*Attached File*)`, authHeader);
  console.log(`File/Attachment messages found: ${docMsgs?.length || 0}`);
  if (Array.isArray(docMsgs) && docMsgs.length > 0) {
    docMsgs.forEach(m => {
      console.log(` - ID: ${m.id} | Content: ${m.content} | Sender ID: ${m.sender_id} | Created: ${m.created_at}`);
    });
  } else {
    console.log(" (No file attachment messages found in public.messages)");
  }

  console.log("\n3. --- Querying Storage Buckets ---");
  const buckets = await querySupabase(`/storage/v1/bucket`, authHeader);
  console.log("Storage buckets:", buckets);
}

checkFilesAndAttachments();
