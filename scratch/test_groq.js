const GROQ_API_KEY = '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';

async function test() {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Output valid JSON with {"status": "success"}' }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
