const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = 'AIzaSyCt4As55NIuVnyr7ibzLPjdw-_epUPSbgQ';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello!");
    const response = await result.response;
    console.log(response.text());
  } catch(e) {
    console.error("Failed:", e.message);
  }
}
test();
