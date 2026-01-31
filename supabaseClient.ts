import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cnyhgpdwfydhsqpluljx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-S2NAYdRwwneoIlgrKZ_UQ_pB2TqYbz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
