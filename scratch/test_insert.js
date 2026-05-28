const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const dummyScore = {
    candidate_name: 'DUBEY ADARSH SUSHIL KUMAR',
    application_number: '2617029270',
    total_marks: 85,
    physics_marks: 20,
    chemistry_marks: 30,
    maths_marks: 35,
    group_type: 'PCM',
    attempt: 'Attempt 2',
    exam_date: 'May 14',
    shift: 'Shift 2',
    raw_html: 'dummy'
  };

  const { data, error } = await supabase
    .from('scores_attempt2')
    .upsert(dummyScore, { onConflict: 'application_number,attempt' })
    .select();

  if (error) {
    console.error('Supabase Error:', error);
  } else {
    console.log('Success:', data);
  }
}

main();
