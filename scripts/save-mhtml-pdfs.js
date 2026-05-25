/**
 * save-mhtml-pdfs.js
 * 
 * Fetches the MHTML records (with embedded base64 images) from Supabase
 * and converts them to PDF using Puppeteer.
 * 
 * Usage:  node scripts/save-mhtml-pdfs.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const supabaseUrl = 'https://aeqvohqqfltsvngxapge.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk';

const supabase = createClient(supabaseUrl, supabaseKey);
const OUT_DIR = path.join(__dirname, '..', 'shift-response-sheets');

function sanitize(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\n🔍  Fetching records with embedded base64 images from Supabase...\n');

  // Fetch ALL raw_html that are large enough to contain embedded images (> 1MB)
  // We do this in batches since they're huge
  const BATCH = 5;
  const { count } = await supabase
    .from('scores')
    .select('id', { count: 'exact', head: true })
    .not('raw_html', 'is', null);

  console.log(`   Total raw_html records: ${count}`);

  const mhtmlRecords = [];

  for (let offset = 0; offset < count; offset += BATCH) {
    process.stdout.write(`   Scanning batch ${offset + 1}-${Math.min(offset + BATCH, count)}...\r`);

    const { data, error } = await supabase
      .from('scores')
      .select('id, exam_date, shift, attempt, raw_html')
      .not('raw_html', 'is', null)
      .order('exam_date')
      .order('shift')
      .range(offset, offset + BATCH - 1);

    if (error) continue;

    for (const row of data) {
      const html = row.raw_html || '';
      // Check for embedded base64 image data (real question images, not tiny CSS icons)
      if (html.includes('data:image/jpeg;base64,') && html.length > 1000000) {
        mhtmlRecords.push(row);
      }
    }
  }

  console.log(`\n\n   Found ${mhtmlRecords.length} record(s) with embedded images.\n`);

  if (mhtmlRecords.length === 0) {
    console.log('   Nothing to convert. Exiting.');
    return;
  }

  // De-duplicate by shift (keep first per shift)
  const seenShifts = new Set();
  const uniqueRecords = [];
  for (const r of mhtmlRecords) {
    const key = `${r.attempt}|${r.exam_date}|${r.shift}`;
    if (!seenShifts.has(key)) {
      seenShifts.add(key);
      uniqueRecords.push(r);
    }
  }

  console.log(`   Unique shifts to convert: ${uniqueRecords.length}\n`);

  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: 'new' });
  let saved = 0;

  for (const r of uniqueRecords) {
    const label = `${r.attempt} - ${r.exam_date} ${r.shift}`;
    const filename = sanitize(`${r.attempt}_${r.exam_date}_${r.shift}_FULL`);

    process.stdout.write(`   📥  ${label}  ...  `);

    try {
      // Save the full HTML with embedded images
      const htmlPath = path.join(OUT_DIR, `${filename}.html`);
      fs.writeFileSync(htmlPath, r.raw_html, 'utf-8');

      // Convert to PDF
      const page = await browser.newPage();
      await page.setContent(r.raw_html, { waitUntil: 'networkidle0', timeout: 60000 });
      
      const pdfPath = path.join(OUT_DIR, `${filename}.pdf`);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      });
      await page.close();

      const pdfSize = (fs.statSync(pdfPath).size / (1024 * 1024)).toFixed(2);
      console.log(`✅ HTML + PDF saved (${pdfSize} MB)`);
      saved++;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }

  await browser.close();

  console.log(`\n🎉  Done! ${saved} full response sheet(s) with images saved to:`);
  console.log(`   ${OUT_DIR}\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
