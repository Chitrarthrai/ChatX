async function run() {
  const url = 'https://bvvocllzbvrodjdgjyib.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo';

  const res = await fetch(`${url}/rest/v1/profiles?select=id,full_name,username,email,status,last_seen`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });

  const json = await res.json();
  console.log('PROFILES IN DB:', json);
}

run();
