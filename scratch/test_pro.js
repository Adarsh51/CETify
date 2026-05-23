const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'AIzaSyCt4As55NIuVnyr7ibzLPjdw-_epUPSbgQ' });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [{ text: "Hello!" }],
    });
    console.log("Success gemini-1.5-pro:", response.text);
  } catch (err) {
    console.error("Error pro:", err.message);
  }
}
test();
