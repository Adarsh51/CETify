/**
 * download-shifts.js
 * 
 * Fetches one raw_html response sheet per unique (exam_date, shift, attempt)
 * from Supabase, saves each as an HTML file, and converts it to PDF using Puppeteer.
 * 
 * Output folder: ./shift-response-sheets/
 * 
 * Usage:  node scripts/download-shifts.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ─── Supabase Setup ───────────────────────────────────────────────────
const supabaseUrl = 'https://aeqvohqqfltsvngxapge.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk';

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Output Folder ────────────────────────────────────────────────────
const OUT_DIR = path.join(__dirname, '..', 'shift-response-sheets');

// ─── Helpers ──────────────────────────────────────────────────────────
function sanitize(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// ─── Main ─────────────────────────────────────────────────────────────
async function main() {
  // 1. Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // 2. Discover unique (exam_date, shift, attempt) combos that have raw_html
  console.log('\n🔍  Discovering shifts with raw_html data in Supabase ...\n');

  const { data: rows, error: discoverErr } = await supabase
    .from('scores')
    .select('exam_date, shift, attempt')
    .not('raw_html', 'is', null)
    .order('exam_date')
    .order('shift');

  if (discoverErr) {
    console.error('❌  Discovery query failed:', discoverErr.message);
    process.exit(1);
  }

  // De-duplicate
  const seen = new Set();
  const uniqueShifts = [];
  for (const r of rows) {
    const key = `${r.exam_date}|${r.shift}|${r.attempt}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueShifts.push({ examDate: r.exam_date, shift: r.shift, attempt: r.attempt });
    }
  }

  console.log(`   Found ${uniqueShifts.length} unique shifts with HTML data.\n`);

  if (uniqueShifts.length === 0) {
    console.log('   Nothing to download. Exiting.');
    return;
  }

  // 3. Try to load Puppeteer for PDF conversion (optional)
  let puppeteer = null;
  try {
    puppeteer = require('puppeteer');
    console.log('   ✅ Puppeteer detected — will generate PDFs as well.\n');
  } catch {
    console.log('   ⚠️  Puppeteer not installed — saving HTML files only.');
    console.log('      To also generate PDFs, run: npm i puppeteer\n');
  }

  let browser = null;
  if (puppeteer) {
    browser = await puppeteer.launch({ headless: 'new' });
  }

  // 4. Fetch and save each shift
  let saved = 0;
  for (const s of uniqueShifts) {
    const label = `${s.attempt} - ${s.examDate} ${s.shift}`;
    const filename = sanitize(`${s.attempt}_${s.examDate}_${s.shift}`);

    process.stdout.write(`   📥  ${label}  ...  `);

    // Fetch ONE raw_html for this shift
    const { data: row, error: fetchErr } = await supabase
      .from('scores')
      .select('raw_html')
      .eq('exam_date', s.examDate)
      .eq('shift', s.shift)
      .eq('attempt', s.attempt)
      .not('raw_html', 'is', null)
      .limit(1)
      .single();

    if (fetchErr || !row?.raw_html) {
      console.log(`SKIP (${fetchErr?.message || 'no data'})`);
      continue;
    }

    // Save HTML
    const htmlPath = path.join(OUT_DIR, `${filename}.html`);
    fs.writeFileSync(htmlPath, row.raw_html, 'utf-8');

    // Convert to PDF if Puppeteer available
    if (browser) {
      try {
        const page = await browser.newPage();
        await page.setContent(row.raw_html, { waitUntil: 'networkidle0', timeout: 30000 });
        const pdfPath = path.join(OUT_DIR, `${filename}.pdf`);
        await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
        await page.close();
        console.log(`✅ HTML + PDF saved`);
      } catch (pdfErr) {
        console.log(`✅ HTML saved  ⚠️ PDF failed: ${pdfErr.message}`);
      }
    } else {
      console.log('✅ HTML saved');
    }

    saved++;
  }

  if (browser) await browser.close();

  console.log(`\n🎉  Done! ${saved} shift response sheets saved to:`);
  console.log(`   ${OUT_DIR}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
