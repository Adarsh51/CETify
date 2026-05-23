const GROQ_API_KEY = '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';

async function test() {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
  });
  const data = await res.json();
  const models = data.data.filter(m => m.id.includes('vision') || m.id.includes('llama-3.2') || m.id.includes('llama-4')).map(m => m.id);
  console.log(models);
}
test();
