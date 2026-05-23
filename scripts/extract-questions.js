/**
 * CETify Question Extraction Script
 * 
 * Extracts questions from stored response sheets in Supabase,
 * sends question/option images to Gemini 2.5 Flash for text extraction + explanation,
 * and inserts the results into the `questions` table.
 * 
 * Usage: node scripts/extract-questions.js [--shift "April 11 Shift 1"] [--all]
 */

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const cheerio = require('cheerio');

// ─── Config ───────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://aeqvohqqfltsvngxapge.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCt4As55NIuVnyr7ibzLPjdw-_epUPSbgQ';
const GEMINI_MODEL = 'gemini-2.0-flash';

const RPM_LIMIT = 15; // Gemini 2.0 Flash has 15 RPM
const DELAY_MS = Math.ceil(60000 / RPM_LIMIT);
const MAX_RETRIES = 3;

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── MHTML Decoder ────────────────────────────────────────────────────
function decodeQuotedPrintable(input) {
  let output = input.replace(/=\r?\n/g, '');
  output = output.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  return output;
}

function extractHtmlFromMhtml(mhtmlContent) {
  const boundaryMatch = mhtmlContent.match(/boundary="?([^"\r\n]+)"?/i);
  if (!boundaryMatch) return mhtmlContent;

  const boundary = boundaryMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = mhtmlContent.split(new RegExp(`--${boundary}`, 'i'));

  for (const part of parts) {
    if (part.toLowerCase().includes('content-type: text/html')) {
      const headerEndIndex = part.indexOf('\r\n\r\n');
      const headerEndIndexLF = part.indexOf('\n\n');
      let contentStartIndex = -1;
      if (headerEndIndex !== -1) contentStartIndex = headerEndIndex + 4;
      else if (headerEndIndexLF !== -1) contentStartIndex = headerEndIndexLF + 2;

      if (contentStartIndex !== -1) {
        const rawHtml = part.substring(contentStartIndex);
        if (part.toLowerCase().includes('content-transfer-encoding: quoted-printable')) {
          return decodeQuotedPrintable(rawHtml);
        }
        return rawHtml;
      }
    }
  }
  return mhtmlContent;
}

// ─── URL Normalizer ───────────────────────────────────────────────────
function normalizeImageUrl(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  
  // Handle local paths like "./Assessment..._files/Q_123.jpeg"
  const filenameMatch = src.match(/([QO]_[0-9]+\.jpeg)/);
  if (filenameMatch) {
    return `https://d2jthxyn067jut.cloudfront.net/CET26/${filenameMatch[1]}`;
  }
  return src;
}

// ─── HTML Parser ──────────────────────────────────────────────────────
function parseQuestionsFromHtml(htmlContent) {
  // Handle MHTML
  const html = extractHtmlFromMhtml(htmlContent);
  const $ = cheerio.load(html);

  const table = $('#tblObjection');
  if (!table.length) {
    throw new Error('Could not find tblObjection table');
  }

  // Extract exam code from anchors
  let examCode = '';
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/\/([A-Z]+-[A-Z0-9]+)\//);
    if (match && !examCode) examCode = match[1];
  });

  const questions = [];
  const rows = table.find('> tbody > tr, > tr').toArray();

  for (let i = 1; i < rows.length; i++) {
    const row = $(rows[i]);
    const cells = row.children('td').toArray();
    if (cells.length < 3) continue;

    const questionId = $(cells[0]).text().trim();
    const section = $(cells[1]).text().trim().toUpperCase();
    const questionCell = $(cells[2]);

    // Validate section
    if (!['PHYSICS', 'CHEMISTRY', 'MATHEMATICS'].includes(section)) continue;
    const subject = section === 'PHYSICS' ? 'Physics' : section === 'CHEMISTRY' ? 'Chemistry' : 'Mathematics';

    // Extract question image URL
    const questionImg = questionCell.find('.Box img, div.Box img').first();
    const questionImageUrl = normalizeImageUrl(questionImg.attr('src'));

    // Extract options (each in a BoxOption td)
    const options = [];
    questionCell.find('.BoxOption, td.BoxOption').each((j, optEl) => {
      const optionId = $(optEl).find('.BoxNumber').first().text().trim();
      const optionImg = $(optEl).find('.BoxOp img, div.BoxOp img').first();
      const optionImageUrl = normalizeImageUrl(optionImg.attr('src'));
      if (optionId) {
        options.push({ id: optionId, imageUrl: optionImageUrl });
      }
    });

    // Extract correct option
    let correctOptionId = '';
    questionCell.find('b').each((j, bEl) => {
      if ($(bEl).text().includes('Correct Option:')) {
        const td = $(bEl).closest('td');
        const span = td.find('span').first();
        correctOptionId = span.text().trim();
      }
    });

    if (!questionId || !questionImageUrl || options.length < 4 || !correctOptionId) {
      console.warn(`  ⚠ Skipping question ${questionId}: missing data (img: ${!!questionImageUrl}, opts: ${options.length}, correct: ${!!correctOptionId})`);
      continue;
    }

    // Find correct option index (1-based)
    const correctOptionIndex = options.findIndex(o => o.id === correctOptionId) + 1;

    questions.push({
      questionId,
      subject,
      questionImageUrl,
      options,
      correctOptionId,
      correctOptionIndex: correctOptionIndex || 1,
      examCode,
    });
  }

  return questions;
}

// ─── Image Downloader ─────────────────────────────────────────────────
async function downloadImageAsBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (err) {
    console.error(`  ✗ Failed to download ${url}: ${err.message}`);
    return null;
  }
}

// ─── Gemini API Call ──────────────────────────────────────────────────
async function extractQuestionWithGemini(question) {
  const questionImageB64 = await downloadImageAsBase64(question.questionImageUrl);
  if (!questionImageB64) return null;

  const optionImagesB64 = [];
  for (const opt of question.options) {
    const b64 = await downloadImageAsBase64(opt.imageUrl);
    if (!b64) return null;
    optionImagesB64.push(b64);
  }

  const correctLabel = ['A', 'B', 'C', 'D'][question.correctOptionIndex - 1] || 'A';

  const prompt = `You are analyzing an MHT CET 2026 exam question (${question.subject}).

Image 1: The question
Images 2-5: Options A, B, C, D (in order)

The correct answer is Option ${correctLabel}.

Return ONLY valid JSON.
CRITICAL: You MUST double-escape all LaTeX backslashes to ensure the JSON is valid (e.g., use \\\\frac instead of \\frac).
{
  "questionText": "Full question text. Use LaTeX: $...$ for inline math, $$...$$ for display math. If the question contains a diagram or figure that cannot be described as text, prefix with [FIGURE] and describe it briefly.",
  "options": [
    "Option A text with LaTeX. Example: $W = \\\\frac{T}{R}$",
    "Option B text with LaTeX. Example: $\\\\sqrt{2}$",
    "Option C text with LaTeX",
    "Option D text with LaTeX"
  ],
  "explanation": "2-3 sentence explanation of WHY Option ${correctLabel} is correct. Mention the key formula/concept. Use LaTeX for any math."
}`;

  const contents = [
    { inlineData: { mimeType: 'image/jpeg', data: questionImageB64 } },
    ...optionImagesB64.map(b64 => ({ inlineData: { mimeType: 'image/jpeg', data: b64 } })),
    { text: prompt },
  ];

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      let text = response.text.trim();
      
      // Clean potential markdown fences
      text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

      const parsed = JSON.parse(text);
      return parsed;
    } catch (err) {
      console.warn(`  ⚠ Groq attempt ${attempt + 1}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES - 1) {
        await sleep(2000 * (attempt + 1)); // Exponential backoff
      }
    }
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ─── Main ─────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  let targetShifts = [];

  if (args.includes('--all')) {
    targetShifts = null; // Process all
  } else if (args.includes('--shift')) {
    const idx = args.indexOf('--shift');
    targetShifts = [args[idx + 1]];
  } else {
    // Default: first 2 shifts for testing
    targetShifts = ['April 11 Shift 1', 'April 11 Shift 2'];
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║      CETify Question Extraction Pipeline        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Step 1: Get list of available shifts (lightweight query, no raw_html)
  console.log('📦 Checking available shifts in Supabase...');

  const { data: shiftList, error: shiftError } = await supabase
    .from('scores')
    .select('exam_date, shift')
    .not('raw_html', 'is', null);

  if (shiftError) {
    console.error('❌ Supabase error:', shiftError.message);
    return;
  }

  // Deduplicate shifts
  const uniqueShifts = new Map();
  for (const row of shiftList) {
    const key = `${row.exam_date} ${row.shift}`;
    if (!uniqueShifts.has(key)) {
      uniqueShifts.set(key, { exam_date: row.exam_date, shift: row.shift });
    }
  }

  // Filter to target shifts
  let shiftsToProcess = Array.from(uniqueShifts.entries());
  if (targetShifts) {
    shiftsToProcess = shiftsToProcess.filter(([key]) => targetShifts.includes(key));
  }

  console.log(`   Found ${uniqueShifts.size} unique shifts, processing ${shiftsToProcess.length}:\n`);
  for (const [key] of shiftsToProcess) {
    console.log(`   • ${key}`);
  }

  // Step 2: Check which questions already exist (resume capability)
  const { data: existingQuestions } = await supabase
    .from('questions')
    .select('question_id, exam_date, shift');

  const existingSet = new Set(
    (existingQuestions || []).map(q => `${q.question_id}|${q.exam_date}|${q.shift}`)
  );
  console.log(`\n   ${existingSet.size} questions already in database (will skip).\n`);

  // Step 3: Process each shift
  const startTime = Date.now();
  let totalExtracted = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const [shiftKey, shiftInfo] of shiftsToProcess) {
    console.log(`\n${'─'.repeat(54)}`);
    console.log(`📝 Processing: ${shiftKey}`);
    console.log(`${'─'.repeat(54)}`);

    try {
      // Fetch ONE raw_html for this specific shift (avoids timeout)
      console.log(`   📥 Fetching response sheet for ${shiftKey}...`);
      const { data: shiftData, error: fetchError } = await supabase
        .from('scores')
        .select('raw_html')
        .eq('exam_date', shiftInfo.exam_date)
        .eq('shift', shiftInfo.shift)
        .not('raw_html', 'is', null)
        .limit(1)
        .single();

      if (fetchError || !shiftData?.raw_html) {
        console.error(`   ❌ Failed to fetch HTML: ${fetchError?.message || 'No data'}`);
        continue;
      }

      const questions = parseQuestionsFromHtml(shiftData.raw_html);
      console.log(`   Parsed ${questions.length} questions from HTML.\n`);

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const existKey = `${q.questionId}|${shiftInfo.exam_date}|${shiftInfo.shift}`;

        // Skip if already extracted
        if (existingSet.has(existKey)) {
          totalSkipped++;
          process.stdout.write(`   [${i + 1}/${questions.length}] Q${q.questionId} (${q.subject}) — ⏩ Already exists\n`);
          continue;
        }

        process.stdout.write(`   [${i + 1}/${questions.length}] Q${q.questionId} (${q.subject}) — 🤖 Extracting...`);

        // Call Gemini
        const result = await extractQuestionWithGemini(q);

        if (!result) {
          totalFailed++;
          process.stdout.write(` ❌ Failed\n`);
          continue;
        }

        const insertData = {
          question_id: q.questionId,
          exam_date: shiftInfo.exam_date,
          shift: shiftInfo.shift,
          subject: q.subject,
          question_text: result.questionText,
          option_1_id: q.options[0]?.id || '',
          option_1_text: result.options[0] || '',
          option_2_id: q.options[1]?.id || '',
          option_2_text: result.options[1] || '',
          option_3_id: q.options[2]?.id || '',
          option_3_text: result.options[2] || '',
          option_4_id: q.options[3]?.id || '',
          option_4_text: result.options[3] || '',
          correct_option_id: q.correctOptionId,
          correct_option_index: q.correctOptionIndex,
          explanation: result.explanation,
          question_image_url: q.questionImageUrl,
          option_1_image_url: q.options[0]?.imageUrl || '',
          option_2_image_url: q.options[1]?.imageUrl || '',
          option_3_image_url: q.options[2]?.imageUrl || '',
          option_4_image_url: q.options[3]?.imageUrl || '',
          exam_code: q.examCode,
        };

        const { error: insertError } = await supabase
          .from('questions')
          .insert(insertData);

        if (insertError) {
          // Check if duplicate
          if (insertError.code === '23505') {
            process.stdout.write(` ⏩ Duplicate\n`);
            totalSkipped++;
          } else {
            process.stdout.write(` ❌ DB Error: ${insertError.message}\n`);
            totalFailed++;
          }
        } else {
          totalExtracted++;
          existingSet.add(existKey);
          process.stdout.write(` ✅ Done\n`);
        }

        // Rate limit
        if (i < questions.length - 1) {
          await sleep(DELAY_MS);
        }
      }
    } catch (err) {
      console.error(`   ❌ Error processing ${shiftKey}: ${err.message}`);
    }
  }

  // Summary
  const elapsed = Date.now() - startTime;
  console.log(`\n${'═'.repeat(54)}`);
  console.log(`   ✅ Extracted: ${totalExtracted}`);
  console.log(`   ⏩ Skipped:   ${totalSkipped}`);
  console.log(`   ❌ Failed:    ${totalFailed}`);
  console.log(`   ⏱  Duration:  ${formatDuration(elapsed)}`);
  console.log(`${'═'.repeat(54)}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
