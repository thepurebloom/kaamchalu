// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in .env. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.");
}

// Service role client bypasses RLS on the server
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
