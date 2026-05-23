import { supabase } from './lib/supabase';
async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('candidate_tags, industry_interests')
    .limit(1);
  console.log(error ? error.message : 'Columns exist');
}
run();
