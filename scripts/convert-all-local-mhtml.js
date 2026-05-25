/**
 * convert-all-local-mhtml.js
 * 
 * Scans the workspace recursively for .mhtml and .mht files,
 * resolves their candidate details, and renders them to high-fidelity
 * PDFs with embedded images using Puppeteer.
 * 
 * Usage: node scripts/convert-all-local-mhtml.js
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// Supabase config
const supabaseUrl = 'https://aeqvohqqfltsvngxapge.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk';

const supabase = createClient(supabaseUrl, supabaseKey);
const OUT_DIR = path.join(__dirname, '..', 'shift-response-sheets');

// Quoted-Printable Decoder for MHTML
function decodeQuotedPrintable(input) {
  let output = input.replace(/=\r?\n/g, '');
  output = output.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  return output;
}

function extractHtmlFromMhtml(mhtmlContent) {
  const boundaryMatch = mhtmlContent.match(/boundary="?([^"\r\n]+)"?/i);
  if (!boundaryMatch) {
    return mhtmlContent;
  }
  
  const boundary = boundaryMatch[1];
  const parts = mhtmlContent.split(new RegExp(`--${boundary}`, 'i'));
  
  for (const part of parts) {
    if (part.toLowerCase().includes('content-type: text/html')) {
      const headerEndIndex = part.indexOf('\r\n\r\n');
      const headerEndIndexLF = part.indexOf('\n\n');
      
      let contentStartIndex = -1;
      if (headerEndIndex !== -1) {
        contentStartIndex = headerEndIndex + 4;
      } else if (headerEndIndexLF !== -1) {
        contentStartIndex = headerEndIndexLF + 2;
      }
      
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

function sanitize(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Recursively find .mht and .mhtml files
function findMhtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, .next
      if (file !== 'node_modules' && file !== '.git' && file !== '.next' && file !== 'shift-response-sheets') {
        findMhtmlFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.mhtml' || ext === '.mht') {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

// Query Supabase to find slot details by application number
async function findSlotDetails(applicationNumber) {
  if (!applicationNumber) return null;
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('attempt, exam_date, shift')
      .eq('application_number', applicationNumber)
      .limit(1);
      
    if (error || !data || data.length === 0) {
      return null;
    }
    return data[0];
  } catch (err) {
    console.error('Supabase lookup failed:', err.message);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('\n🔎  Scanning workspace recursively for .mhtml and .mht files...\n');
  const workspaceRoot = path.join(__dirname, '..');
  const mhtmlFiles = findMhtmlFiles(workspaceRoot);

  if (mhtmlFiles.length === 0) {
    console.log('❌  No local .mhtml or .mht files found in the workspace.\n');
    return;
  }

  console.log(`✅  Found ${mhtmlFiles.length} file(s):`);
  for (const f of mhtmlFiles) {
    const relPath = path.relative(workspaceRoot, f);
    const sizeMB = (fs.statSync(f).size / (1024 * 1024)).toFixed(2);
    console.log(`   - [${sizeMB} MB]  ${relPath}`);
  }
  console.log('');

  // Launch Puppeteer
  const browser = await puppeteer.launch({ headless: 'new' });
  
  for (const filePath of mhtmlFiles) {
    const relPath = path.relative(workspaceRoot, filePath);
    const originalName = path.basename(filePath, path.extname(filePath));
    console.log(`⚙️   Processing: ${relPath}`);

    try {
      // 1. Read file to extract candidate info
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const htmlContent = extractHtmlFromMhtml(fileContent);
      const $ = cheerio.load(htmlContent);
      
      // Extract candidate info
      const navSpan = $('span.hidden-sm.hidden-md').text().trim();
      let applicationNumber = '';
      let candidateName = '';
      
      if (navSpan) {
        const dashIndex = navSpan.indexOf(' - ');
        if (dashIndex !== -1) {
          applicationNumber = navSpan.substring(0, dashIndex).trim();
          candidateName = navSpan.substring(dashIndex + 3).trim();
        } else {
          candidateName = navSpan;
        }
      }

      console.log(`     Candidate: ${candidateName || 'Unknown'} (App: ${applicationNumber || 'Unknown'})`);

      // 2. Query slot details from Supabase if we have application number
      let slotDetails = await findSlotDetails(applicationNumber);
      let targetFilename = '';

      if (slotDetails) {
        const attemptClean = sanitize(slotDetails.attempt);
        const dateClean = sanitize(slotDetails.exam_date);
        const shiftClean = sanitize(slotDetails.shift);
        targetFilename = `${attemptClean}_${dateClean}_${shiftClean}_FULL`;
        console.log(`     Mapped to DB Shift: ${slotDetails.attempt} | ${slotDetails.exam_date} | ${slotDetails.shift}`);
      } else {
        targetFilename = sanitize(`${originalName}_FULL`);
        console.log(`     ⚠️  Could not map to database record. Using filename: ${targetFilename}`);
      }

      // 3. Convert to PDF using Puppeteer
      const page = await browser.newPage();
      
      // Using direct file:// URL is much better for Puppeteer rendering local images/resources inside MHTML
      const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
      console.log(`     Loading file into browser...`);
      
      await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 90000 });
      
      const pdfPath = path.join(OUT_DIR, `${targetFilename}.pdf`);
      console.log(`     Generating PDF...`);
      
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
      });
      
      await page.close();

      const pdfSizeMB = (fs.statSync(pdfPath).size / (1024 * 1024)).toFixed(2);
      console.log(`     ✅  PDF generated successfully!`);
      console.log(`         Saved to: shift-response-sheets/${targetFilename}.pdf (${pdfSizeMB} MB)\n`);
    } catch (err) {
      console.error(`     ❌  Failed to convert: ${err.message}\n`);
    }
  }

  await browser.close();
  console.log('🎉  All local .mhtml/.mht conversions completed!\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
