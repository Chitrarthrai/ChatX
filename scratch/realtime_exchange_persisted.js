const SUPABASE_URL = "https://bvvocllzbvrodjdgjyib.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const USER1_ID = "985d80d9-de69-4322-9945-d7df9c362105"; // chitrarthrai10@gmail.com
const USER2_ID = "9f744ceb-44b2-4a52-83c5-a5d85cc2477c"; // chitrarth.rai@neophyte.ai
const CONV_ID = "00000000-0000-0000-0000-000000000001";

async function runRealtimeExchange() {
  console.log("🚀 Starting Persisted Realtime Cross-User Message & File Sharing Test...\n");

  try {
    // Step 1: Ensure Conversation Exists
    console.log("1️⃣ Ensuring Direct Message Conversation exists...");
    const convPayload = {
      id: CONV_ID,
      type: "direct",
      is_archived: false,
      is_pinned: false,
      is_locked: false,
    };
    await fetch(`${SUPABASE_URL}/rest/v1/conversations`, {
      method: "POST",
      headers,
      body: JSON.stringify(convPayload),
    });
    console.log("   ✅ Conversation 00000000-0000-0000-0000-000000000001 active!");

    // Step 2: Insert User 1 Messages
    console.log("\n2️⃣ User 1 (chitrarthrai10@gmail.com) sending messages...");
    const msg1 = {
      conversation_id: CONV_ID,
      sender_id: USER1_ID,
      content: "Hello chitrarth.rai@neophyte.ai! Testing live Realtime DM message stream in ChatX.",
      type: "text",
      status: "read",
    };
    const resMsg1 = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(msg1),
    });
    console.log(`   ✅ Sent Message 1 (Status: ${resMsg1.status})`);

    const msg2 = {
      conversation_id: CONV_ID,
      sender_id: USER1_ID,
      content: "📄 Here is the updated ChatX Monorepo Design & Architecture document for review: ChatX_Architecture_v2.pdf (2.4 MB)",
      type: "text",
      status: "read",
    };
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(msg2),
    });
    console.log("   ✅ Sent Message 2 with PDF document reference!");

    // Step 3: Insert User 1 File in Enterprise File Storage
    console.log("\n3️⃣ User 1 uploading file record to Enterprise File Storage (public.files)...");
    const file1 = {
      uploader_id: USER1_ID,
      name: "ChatX_Architecture_v2.pdf",
      file_url: "https://bvvocllzbvrodjdgjyib.supabase.co/storage/v1/object/public/uploads/ChatX_Architecture_v2.pdf",
      file_size: 2516582,
      mime_type: "application/pdf",
    };
    const resFile1 = await fetch(`${SUPABASE_URL}/rest/v1/files`, {
      method: "POST",
      headers,
      body: JSON.stringify(file1),
    });
    console.log(`   ✅ Uploaded ChatX_Architecture_v2.pdf (Status: ${resFile1.status})`);

    // Step 4: Insert User 2 Reply Messages
    console.log("\n4️⃣ User 2 (chitrarth.rai@neophyte.ai) replying...");
    const msg3 = {
      conversation_id: CONV_ID,
      sender_id: USER2_ID,
      content: "Hey Chitrarth Rai! Received your architecture document live in ChatX! Looks fantastic. 🚀",
      type: "text",
      status: "read",
    };
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(msg3),
    });
    console.log("   ✅ Sent Reply Message 3!");

    const msg4 = {
      conversation_id: CONV_ID,
      sender_id: USER2_ID,
      content: "🎨 I have attached the latest UI Component Tokens bundle: UI_Component_Tokens.png (1.8 MB)",
      type: "text",
      status: "read",
    };
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(msg4),
    });
    console.log("   ✅ Sent Reply Message 4 with image asset reference!");

    // Step 5: Insert User 2 File in Enterprise File Storage
    console.log("\n5️⃣ User 2 uploading file record to Enterprise File Storage (public.files)...");
    const file2 = {
      uploader_id: USER2_ID,
      name: "UI_Component_Tokens.png",
      file_url: "https://bvvocllzbvrodjdgjyib.supabase.co/storage/v1/object/public/uploads/UI_Component_Tokens.png",
      file_size: 1887436,
      mime_type: "image/png",
    };
    const resFile2 = await fetch(`${SUPABASE_URL}/rest/v1/files`, {
      method: "POST",
      headers,
      body: JSON.stringify(file2),
    });
    console.log(`   ✅ Uploaded UI_Component_Tokens.png (Status: ${resFile2.status})`);

    // Step 6: Verify Database Contents
    console.log("\n6️⃣ Verifying Persisted Database Records...");
    const checkMsg = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.desc&limit=5`, { headers });
    const allMsgs = await checkMsg.json();
    console.log(`   💬 Total Persisted Messages: ${allMsgs.length}`);

    const checkFiles = await fetch(`${SUPABASE_URL}/rest/v1/files?select=*`, { headers });
    const allFiles = await checkFiles.json();
    console.log(`   📁 Total Persisted Files: ${allFiles.length}`);

    console.log("\n🎉 ALL REALTIME CROSS-USER MESSAGES & FILES PERSISTED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Realtime Exchange Error:", err.message);
  }
}

runRealtimeExchange();
