import { jsPDF } from 'jspdf';
import { CalculationResult, ExamMeta, ExamSlotDetails } from '../types';

export function generatePdfReport(
  result: CalculationResult,
  meta: ExamMeta,
  slot: ExamSlotDetails
) {
  // Initialize jsPDF with A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // A4 dimensions: 210 x 297 mm
  
  // 1. Draw top accent bar
  doc.setFillColor(67, 56, 202); // #4338ca (Indigo)
  doc.rect(0, 0, 210, 8, 'F');

  // 2. Logo / Branding
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CET', 20, 25);
  
  doc.setTextColor(67, 56, 202); // #4338ca
  doc.text('ify', 36, 25);

  doc.setTextColor(156, 163, 175); // gray-400
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('OFFICIAL MHT CET SCORE REPORT', 20, 30);

  // 3. Verified Badge (Top Right)
  doc.setFillColor(240, 253, 244); // light green bg
  doc.roundedRect(162, 18, 28, 8, 1.5, 1.5, 'F');
  doc.setDrawColor(187, 247, 208); // border green
  doc.roundedRect(162, 18, 28, 8, 1.5, 1.5, 'S');
  doc.setTextColor(22, 163, 74); // text green
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Verified ✓', 168, 23.5);

  // Horizontal separator line
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.setLineWidth(0.4);
  doc.line(20, 36, 190, 36);

  // 4. Candidate Info Box
  doc.setFillColor(249, 250, 251); // gray-50
  doc.roundedRect(20, 42, 170, 32, 2, 2, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(20, 42, 170, 32, 2, 2, 'S');

  // Row 1 titles
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text('CANDIDATE NAME', 26, 49);
  doc.text('APPLICATION NO.', 126, 49);

  // Row 1 values
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // slate-900
  const name = meta.candidateName ? meta.candidateName.toUpperCase() : 'N/A';
  const displayName = name.length > 36 ? name.substring(0, 36) + '...' : name;
  doc.text(displayName, 26, 54);
  doc.text(meta.applicationNumber || 'N/A', 126, 54);

  // Row 2 titles
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('EXAM SESSION', 26, 63);
  doc.text('DATE & SHIFT', 126, 63);

  // Row 2 values
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`${slot.attempt} (${slot.groupType})`, 26, 68);
  doc.text(`${slot.examDate} - ${slot.shift}`, 126, 68);

  // 5. Total Score Box (Left)
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.roundedRect(20, 82, 52, 65, 3, 3, 'F');
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.roundedRect(20, 82, 52, 65, 3, 3, 'S');

  doc.setTextColor(79, 70, 229); // indigo-600
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL SCORE', 31, 94);

  // Main huge score number
  doc.setFontSize(44);
  const scoreStr = String(result.totalMarks);
  const scoreWidth = doc.getTextWidth(scoreStr);
  const scoreX = 20 + (52 - scoreWidth) / 2;
  doc.text(scoreStr, scoreX, 116);

  doc.setTextColor(107, 114, 128); // gray-500
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`/ ${result.maxMarks}`, 34, 128);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74); // green-600
  doc.text(`${result.percentage}% Accuracy`, 20 + (52 - doc.getTextWidth(`${result.percentage}% Accuracy`)) / 2, 138);

  // 6. Subject Breakdown Box (Right)
  const tblX = 78;
  const tblY = 82;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(tblX, tblY, 112, 65, 3, 3, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(tblX, tblY, 112, 65, 3, 3, 'S');

  // Table header background
  doc.setFillColor(249, 250, 251); // gray-50
  doc.roundedRect(tblX + 0.2, tblY + 0.2, 111.6, 10, 3, 3, 'F');
  doc.rect(tblX + 0.2, tblY + 5, 111.6, 5.2, 'F'); // remove bottom rounding overlay

  // Table headers
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('SUBJECT', tblX + 6, tblY + 7);
  doc.text('CORRECT', tblX + 42, tblY + 7);
  doc.text('ACCURACY', tblX + 66, tblY + 7);
  doc.text('SCORE', tblX + 92, tblY + 7);

  // Physics Row
  const phyY = tblY + 22;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Physics', tblX + 6, phyY);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(75, 85, 99); // gray-600
  doc.text(`${result.physics.correct} / 50`, tblX + 42, phyY);
  doc.text(`${result.physics.accuracy}%`, tblX + 66, phyY);
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${result.physics.marks} / 50`, tblX + 92, phyY);

  // Row line divider
  doc.setDrawColor(243, 244, 246);
  doc.line(tblX + 4, phyY + 6, tblX + 108, phyY + 6);

  // Chemistry Row
  const chemY = tblY + 38;
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Chemistry', tblX + 6, chemY);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`${result.chemistry.correct} / 50`, tblX + 42, chemY);
  doc.text(`${result.chemistry.accuracy}%`, tblX + 66, chemY);
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${result.chemistry.marks} / 50`, tblX + 92, chemY);

  // Row line divider
  doc.line(tblX + 4, chemY + 6, tblX + 108, chemY + 6);

  // Maths Row
  const mathY = tblY + 54;
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Mathematics', tblX + 6, mathY);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`${result.maths.correct} / 50`, tblX + 42, mathY);
  doc.text(`${result.maths.accuracy}%`, tblX + 66, mathY);
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${result.maths.marks} / 100`, tblX + 92, mathY);

  // 7. Performance Stats Summary
  const statY = 155;
  doc.setFillColor(249, 250, 251); // gray-50
  doc.roundedRect(20, statY, 170, 34, 3, 3, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(20, statY, 170, 34, 3, 3, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('CORRECT ANSWERS', 26, statY + 11);
  doc.text('INCORRECT ANSWERS', 82, statY + 11);
  doc.text('UNATTEMPTED QUESTIONS', 134, statY + 11);

  doc.setFontSize(13);
  doc.setTextColor(22, 163, 74); // green-600
  doc.text(String(result.totalCorrect), 26, statY + 24);
  
  doc.setTextColor(220, 38, 38); // red-600
  doc.text(String(result.totalIncorrect), 82, statY + 24);
  
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(String(result.totalUnattempted), 134, statY + 24);

  // 8. Note box
  const noteY = 197;
  doc.setFillColor(254, 252, 232); // yellow-50
  doc.roundedRect(20, noteY, 170, 26, 2, 2, 'F');
  doc.setDrawColor(254, 240, 138); // yellow-200
  doc.roundedRect(20, noteY, 170, 26, 2, 2, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(133, 77, 14); // yellow-800
  doc.text('PRIVACY & DISCLOSURE NOTE', 25, noteY + 8);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(161, 98, 7); // yellow-700
  doc.text('This scorecard was securely calculated locally in your browser. All student response data is processed', 25, noteY + 14);
  doc.text('privately. This report is an estimation based on the parsed official objection tracker HTML data key.', 25, noteY + 19);

  // 9. Footer Brand & Timestamp
  doc.setTextColor(156, 163, 175);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('This is a computer generated report and does not require a physical signature.', 20, 275);
  doc.text('Generated via CETify (cetify.app) - The fastest, most secure MHT CET score analyzer.', 20, 280);

  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Report Generated: ${now} (IST)`, 134, 280);

  // Save the PDF locally
  const formattedName = meta.candidateName ? meta.candidateName.trim().replace(/\s+/g, '_') : 'Result';
  const filename = `CETify_Score_${formattedName}.pdf`;
  doc.save(filename);
}
