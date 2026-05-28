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
  const [res1, res2] = await Promise.all([
    supabase.from('scores').select('id, candidate_name, attempt, exam_date, shift').ilike('candidate_name', '%dubey adarsh%'),
    supabase.from('scores_attempt2').select('id, candidate_name, attempt, exam_date, shift').ilike('candidate_name', '%dubey adarsh%')
  ]);

  console.log('scores table:', res1.data);
  console.log('scores_attempt2 table:', res2.data);
}

main();
