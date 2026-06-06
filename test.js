require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: profiles, error } = await serviceClient.from('profiles').select('*');
  console.log("Profiles in DB:", profiles);
  if (error) {
    console.error("Error reading profiles:", error);
  }
}

test();
