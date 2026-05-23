const API_KEY = 'AIzaSyCt4As55NIuVnyr7ibzLPjdw-_epUPSbgQ';
const models = ['gemini-1.5-flash-001', 'gemini-1.5-flash-002', 'gemini-1.5-pro-002', 'gemini-2.0-flash-exp'];

async function test() {
  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
    });
    const data = await response.json();
    console.log(m, data.error ? data.error.status : 'SUCCESS');
  }
}
test();
