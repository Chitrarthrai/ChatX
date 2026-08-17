const SUPABASE_URL = "https://bvvocllzbvrodjdgjyib.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo";

async function testLogin(email, password) {
  console.log(`Testing login for: ${email}`);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.error || data.error_description) {
    console.error(" Login Failed Error:", data);
  } else {
    console.log(" Login Successful! User ID:", data.user?.id);
    console.log(" User Email:", data.user?.email);
  }
}

async function runTests() {
  await testLogin("chitrarth.rai@neophyte.ai", "123*#*raisahab");
  await testLogin("chitrarthrai10@gmail.com", "123*#*raisahab");
}

runTests();
