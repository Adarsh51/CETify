const HF_TOKEN = 'hf_xyz'; // We need a real token to test
async function test() {
  const url = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 50
    })
  });
  console.log(res.status, await res.text());
}
test();
