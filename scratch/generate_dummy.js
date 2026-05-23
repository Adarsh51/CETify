const fs = require('fs');

try {
  // Read the sample HTML file
  const inputPath = 'Assessment_Response_Sheet.html';
  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
  }
  
  let html = fs.readFileSync(inputPath, 'utf8');

  // We need to match the block containing Correct Option and Candidate Response
  // and set Candidate Response = Correct Option for all questions, EXCEPT one Math question.

  // Using a regex to match the inner table containing Correct Option and Candidate Response
  // Example: 
  // <b>Correct Option:</b>  <span>317032</span>
  // </td>
  // <td>
  // <b>Candidate Response:</b>  <span>317031 </span>
  
  // Regex to find all Question rows (roughly)
  const rowRegex = /<b>Correct Option:<\/b>\s*<span>(\d+)<\/span>[\s\S]*?<b>Candidate Response:<\/b>\s*<span>\s*(\d*)\s*<\/span>/g;
  
  let matchCount = 0;
  let mathQuestionMissed = false;

  html = html.replace(rowRegex, (match, correctOption, candidateResponse) => {
    matchCount++;
    
    // We need to miss 1 Math question to get 198 marks (200 - 2 = 198)
    // In MHT CET, Math usually comes after Physics and Chemistry (e.g., question 101-150)
    // Let's just miss the 110th question.
    
    let replacementResponse = correctOption; // Make it correct by default
    
    if (matchCount === 120 && !mathQuestionMissed) {
      // Miss this question by providing a wrong option (just alter the last digit)
      replacementResponse = correctOption.slice(0, -1) + (correctOption.endsWith('1') ? '2' : '1');
      mathQuestionMissed = true;
    }

    // Return the replaced block
    return match.replace(
      /<b>Candidate Response:<\/b>\s*<span>\s*(\d*)\s*<\/span>/, 
      `<b>Candidate Response:</b>  <span>${replacementResponse}</span>`
    );
  });
  
  // Let's change the name and application number to show it's a dummy
  html = html.replace(
    /<span class="hidden-sm hidden-md">.*?<\/span>/, 
    '<span class="hidden-sm hidden-md">2222222222 - DUMMY TOPPER 198 MARKS </span>'
  );

  fs.writeFileSync('Dummy_198_Marks_Response_Sheet.html', html, 'utf8');
  console.log(`Generated Dummy_198_Marks_Response_Sheet.html successfully!`);
  console.log(`Total questions processed: ${matchCount}`);
  
} catch (e) {
  console.error(e);
}
