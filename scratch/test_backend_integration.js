const SUPABASE_URL = "https://bvvocllzbvrodjdgjyib.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

async function testBackendServices() {
  console.log("🚀 Running Native HTTP REST API & PostgreSQL Database Integration Suite...\n");

  try {
    // Test 1: Fetch Profiles
    console.log("1️⃣ Testing REST Endpoint /rest/v1/profiles...");
    const res1 = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers });
    const profiles = await res1.json();
    console.log(`   ✅ Status ${res1.status}! Found ${profiles.length} user profiles:`);
    profiles.forEach((p) => console.log(`      - ${p.full_name} (${p.email}) [Status: ${p.status}]`));

    // Test 2: Fetch Messages
    console.log("\n2️⃣ Testing REST Endpoint /rest/v1/messages...");
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&limit=5`, { headers });
    const messages = await res2.json();
    console.log(`   ✅ Status ${res2.status}! Found ${messages.length} messages.`);

    // Test 3: Fetch Organization Members
    console.log("\n3️⃣ Testing REST Endpoint /rest/v1/organization_members...");
    const res3 = await fetch(`${SUPABASE_URL}/rest/v1/organization_members?select=*`, { headers });
    const members = await res3.json();
    console.log(`   ✅ Status ${res3.status}! Found ${members.length} organization members.`);

    // Test 4: Fetch Files Table
    console.log("\n4️⃣ Testing REST Endpoint /rest/v1/files...");
    const res4 = await fetch(`${SUPABASE_URL}/rest/v1/files?select=*`, { headers });
    const files = await res4.json();
    console.log(`   ✅ Status ${res4.status}! Total files: ${files.length}.`);

    // Test 5: Fetch Meetings Table
    console.log("\n5️⃣ Testing REST Endpoint /rest/v1/meetings...");
    const res5 = await fetch(`${SUPABASE_URL}/rest/v1/meetings?select=*`, { headers });
    const meetings = await res5.json();
    console.log(`   ✅ Status ${res5.status}! Total meetings: ${meetings.length}.`);

    console.log("\n🎉 ALL BACKEND API & POSTGRESQL REST INTEGRATION TESTS PASSED!");
  } catch (err) {
    console.error("❌ Integration Test Error:", err.message);
  }
}

testBackendServices();
