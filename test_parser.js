const fs = require('fs');
const path = require('path');

function extractValue(html, label) {
  const regex = new RegExp('<b>' + label + '</b>\\s*<span>([^<]+)</span>', 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

function parseHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const trs = content.split('<tr>');
  const questions = [];
  
  for (let i = 2; i < trs.length; i++) {
    const tr = trs[i];
    if (!tr.includes('Question ID') && tr.includes('Correct Option:')) {
      const qidMatch = tr.match(/<td style="width:10%">\s*([0-9]+)\s*<\/td>/i);
      const questionId = qidMatch ? qidMatch[1].trim() : '';
      
      const tds = tr.split(/<\/?td>/i);
      const section = tds[3] ? tds[3].trim() : '';
      
      const correctOption = extractValue(tr, 'Correct Option:');
      const candidateResponse = extractValue(tr, 'Candidate Response:');
      
      questions.push({
        questionId,
        section,
        correctOption,
        candidateResponse: candidateResponse === '--' || candidateResponse === '' ? null : candidateResponse
      });
    }
  }
  
  return questions;
}

const filePath = path.join(__dirname, 'Assessment_Response_Sheet.html');
const questions = parseHTML(filePath);

console.log('Sample parsed questions:');
console.log(questions.slice(0, 5));

const uniqueSections = [...new Set(questions.map(q => q.section))];
console.log('Unique sections found:', uniqueSections);
