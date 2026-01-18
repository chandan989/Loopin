import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://whssxsnrukuarrhcufsu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
    console.warn('⚠️ SUPABASE_KEY is missing. Database initialization may fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
