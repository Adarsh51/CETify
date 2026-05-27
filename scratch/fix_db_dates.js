const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeqvohqqfltsvngxapge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcXZvaHFxZmx0c3ZuZ3hhcGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjY5MTQsImV4cCI6MjA5NDg0MjkxNH0.tQbKeGmoK7kJiY6OuT6nyjvGz_-0sWFLMSWvYf81Ylk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Updating scores_attempt2 rows where exam_date is "12 May" to "May 12"...');
  
  const { data, error } = await supabase
    .from('scores_attempt2')
    .update({ exam_date: 'May 12' })
    .eq('exam_date', '12 May');

  if (error) {
    console.error('Error updating records:', error);
  } else {
    console.log('Update complete!', data);
  }
}

run();
