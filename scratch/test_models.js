const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'AIzaSyDDtxIxhdBNSAPVrSm-sikIdXJi_WndBhE' });

async function test() {
  try {
    const models = await ai.models.list();
    for (const m of models) {
      if (m.name.includes('gemini')) {
        console.log(m.name);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
