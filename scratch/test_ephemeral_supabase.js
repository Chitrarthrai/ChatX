async function run() {
  const url = 'https://bvvocllzbvrodjdgjyib.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dm9jbGx6YnZyb2RqZGdqeWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNTk1MjYsImV4cCI6MjEwMTkzNTUyNn0._rpexgfnWvRozIcwSUL5x9iCy1DoJKrqaU8jq9zZzKo';

  const payload = {
    type: 'ephemeral_media',
    id: `eph-${Date.now()}`,
    mediaType: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileName: 'Design_System_Blueprint.png',
    fileSize: '0.45 MB',
    viewMode: 'timer',
    timerSeconds: 15,
    viewedBy: [],
    isExpired: false,
    caption: 'Verified Ephemeral View Once Photo',
    senderId: '985d80d9-de69-4322-9945-d7df9c362105',
    senderName: 'Chitrarth Rai'
  };

  const body = {
    conversation_id: 'acbf51eb-0217-4315-850f-300685484035',
    sender_id: '985d80d9-de69-4322-9945-d7df9c362105',
    content: `EPHEMERAL_MEDIA_DATA:${JSON.stringify(payload)}`,
    type: 'image'
  };

  const res = await fetch(`${url}/rest/v1/messages`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  console.log('REST Message Insert Status:', res.status, json);
}

run();
