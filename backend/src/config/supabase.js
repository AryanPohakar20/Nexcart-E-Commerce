import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing Supabase credentials (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).');
} else if (supabaseServiceKey.startsWith('sb_publishable_')) {
  logger.warn('SUPABASE_SERVICE_ROLE_KEY in .env starts with "sb_publishable_". Note: A service_role secret key (sb_secret_...) is recommended for backend operations to bypass Storage RLS.');
}

// Initialize Supabase Client with Service Role Key for backend administration bypass
let supabase = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

export default supabase;
