// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Cambiamos 'process.env' por 'import.meta.env'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl ? 'configured' : 'missing',
  key: supabaseAnonKey ? 'configured' : 'missing',
});

// Verificamos que las variables existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration!', { supabaseUrl, supabaseAnonKey });
  throw new Error(
    'Supabase URL and Anon Key are required. Make sure to set them in your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client created successfully');
