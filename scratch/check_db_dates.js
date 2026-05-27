const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeqvohqqfltsvngxapge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying scores_attempt2 distinct exam_date values...');
  const { data, error } = await supabase
    .from('scores_attempt2')
    .select('exam_date, shift, attempt');

  if (error) {
    console.error('Error fetching scores_attempt2:', error);
    return;
  }

  const freq = {};
  for (const row of data) {
    const key = `${row.attempt} | ${row.exam_date} | ${row.shift}`;
    freq[key] = (freq[key] || 0) + 1;
  }

  console.log('\nFrequency of attempt | exam_date | shift in scores_attempt2:');
  console.log(JSON.stringify(freq, null, 2));
}

run();
