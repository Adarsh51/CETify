const GEMINI_API_KEY = 'AIzaSyCt4As55NIuVnyr7ibzLPjdw-_epUPSbgQ';
async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
  const data = await res.json();
  const models = data.models.map(m => m.name);
  console.log(models);
}
test();
