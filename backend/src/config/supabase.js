const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseUrl = env.supabaseUrl || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = env.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

// Initialize Supabase Client
// We use the Service Role Key in the backend to bypass RLS for administrative actions.
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

module.exports = { supabase };
