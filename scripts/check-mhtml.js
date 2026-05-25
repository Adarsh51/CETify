/**
 * check-mhtml.js
 * 
 * Scans ALL raw_html records in Supabase to find ones that are full MHTML
 * (contain embedded base64 images), not just extracted HTML.
 * 
 * Usage:  node scripts/check-mhtml.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeqvohqqfltsvngxapge.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('\n🔍  Scanning ALL raw_html records for MHTML content...\n');

  // Get count first
  const { count, error: countErr } = await supabase
    .from('scores')
    .select('id', { count: 'exact', head: true })
    .not('raw_html', 'is', null);

  if (countErr) {
    console.error('❌  Count query failed:', countErr.message);
    return;
  }

  console.log(`   Total records with raw_html: ${count}\n`);

  // Fetch in batches of 10 (raw_html can be huge)
  const BATCH = 10;
  const mhtmlRecords = [];
  const htmlOnlyRecords = [];

  for (let offset = 0; offset < count; offset += BATCH) {
    process.stdout.write(`   Checking records ${offset + 1}-${Math.min(offset + BATCH, count)}...\r`);

    const { data, error } = await supabase
      .from('scores')
      .select('id, exam_date, shift, attempt, application_number, candidate_name, raw_html')
      .not('raw_html', 'is', null)
      .order('exam_date')
      .order('shift')
      .range(offset, offset + BATCH - 1);

    if (error) {
      console.error(`\n❌  Fetch error at offset ${offset}:`, error.message);
      continue;
    }

    for (const row of data) {
      const html = row.raw_html || '';
      const first500 = html.substring(0, 500).toLowerCase();
      
      // MHTML indicators
      const isMhtml = 
        first500.includes('mime-version') ||
        first500.includes('content-type: multipart') ||
        first500.includes('from: <saved by') ||
        first500.includes('boundary=');

      // Check for embedded base64 image data anywhere in the content
      const hasBase64Images = html.includes('Content-Transfer-Encoding: base64') || 
                               (html.includes('data:image/jpeg;base64,') && html.length > 100000);

      const label = `${row.attempt} | ${row.exam_date} ${row.shift} | ${row.candidate_name} (${row.application_number})`;

      if (isMhtml || hasBase64Images) {
        mhtmlRecords.push({
          ...row,
          label,
          size: html.length,
          isMhtml,
          hasBase64Images,
        });
      } else {
        htmlOnlyRecords.push({ label, size: html.length });
      }
    }
  }

  console.log('\n');

  // Report MHTML records
  if (mhtmlRecords.length > 0) {
    console.log(`✅  Found ${mhtmlRecords.length} MHTML record(s) with embedded data:\n`);
    for (const r of mhtmlRecords) {
      const sizeMB = (r.size / (1024 * 1024)).toFixed(2);
      console.log(`   📄 ${r.label}`);
      console.log(`      Size: ${sizeMB} MB | MHTML headers: ${r.isMhtml} | Base64 images: ${r.hasBase64Images}`);
    }
  } else {
    console.log('❌  No MHTML records found. All raw_html entries are extracted HTML only.');
  }

  // Report HTML-only records
  console.log(`\n   📊 HTML-only records: ${htmlOnlyRecords.length}`);
  
  // Group HTML-only by shift
  const shiftCounts = {};
  for (const r of htmlOnlyRecords) {
    const key = r.label.split(' | ')[1]; // exam_date + shift
    shiftCounts[key] = (shiftCounts[key] || 0) + 1;
  }
  for (const [shift, cnt] of Object.entries(shiftCounts)) {
    console.log(`      ${shift}: ${cnt} record(s)`);
  }

  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
