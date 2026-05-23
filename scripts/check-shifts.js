// Quick test: check which shifts have raw_html in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeqvohqqfltsvngxapge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Get all unique exam_date + shift combinations that have raw_html
  const { data, error } = await supabase
    .from('scores')
    .select('exam_date, shift, candidate_name, application_number')
    .not('raw_html', 'is', null)
    .order('exam_date')
    .order('shift');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Group by shift
  const shifts = {};
  for (const row of data) {
    const key = `${row.exam_date} ${row.shift}`;
    if (!shifts[key]) {
      shifts[key] = { count: 0, names: [] };
    }
    shifts[key].count++;
    shifts[key].names.push(row.candidate_name);
  }

  console.log('\n=== Shifts with raw_html data ===\n');
  for (const [shift, info] of Object.entries(shifts)) {
    console.log(`  ${shift}: ${info.count} student(s) — ${info.names.join(', ')}`);
  }
  console.log(`\nTotal shifts available: ${Object.keys(shifts).length}`);
  console.log(`Total records with raw_html: ${data.length}`);
}

main();
