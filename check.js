const url = 'https://fohcutrrhrihvzrvynxz.supabase.co/rest/v1/profiles?select=*&limit=1';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaGN1dHJyaHJpaHZ6cnZ5bnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjc2MzUsImV4cCI6MjA4ODY0MzYzNX0.IqPHkCuaP-ohUH_JlF-zyXjR1wInXDplzmBj0upfxoo';

fetch(url, {
  headers: {
    'apikey': apikey,
    'Authorization': `Bearer ${apikey}`
  }
}).then(res => res.json()).then(console.log).catch(console.error);
