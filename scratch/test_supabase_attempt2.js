const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://aeqvohqqfltsvngxapge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk'
);

async function test() {
  console.log("Attempting insert...");
  const { data, error } = await supabase.from('scores_attempt2').upsert({
    candidate_name: 'Test Candidate',
    application_number: 'TEST_001',
    total_marks: 150,
    physics_marks: 40,
    chemistry_marks: 40,
    maths_marks: 70,
    group_type: 'PCM',
    attempt: 'Attempt 2',
    exam_date: '12 May',
    shift: 'Shift 1',
    raw_html: '<html>test</html>'
  }, {
    onConflict: 'application_number,attempt'
  });

  if (error) {
    console.error('Upsert Error:', error);
  } else {
    console.log('Upsert successful:', data);
  }
  
  console.log("Attempting select...");
  const { data: selectData, error: selectError } = await supabase.from('scores_attempt2').select('*').limit(1);
  if (selectError) {
    console.error('Select Error:', selectError);
  } else {
    console.log('Select successful, rows:', selectData ? selectData.length : 0);
  }
}

test();
