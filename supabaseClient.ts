import { createClient } from '@supabase/supabase-js';

// No Vite, variáveis de ambiente devem começar com VITE_ para serem expostas ao navegador.
// Usamos import.meta.env para acessar essas variáveis.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://cnyhgpdwfydhsqpluljx.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-S2NAYdRwwneoIlgrKZ_UQ_pB2TqYbz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);