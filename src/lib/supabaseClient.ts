
import type { Database } from '@/lib/database.types'; // You'll generate this file next
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrlFromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKeyFromEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrlFromEnv || supabaseUrlFromEnv.trim() === '') {
    console.error(
      'CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_URL is not set or is empty in your environment variables. Please ensure it is defined correctly in your .env.local file and that you have restarted your development server. It should look like "https://your-project-ref.supabase.co".'
    );
    throw new Error(
      'Supabase URL is not configured. NEXT_PUBLIC_SUPABASE_URL is missing or empty. Check .env.local and restart server.'
    );
  }
  if (!supabaseAnonKeyFromEnv || supabaseAnonKeyFromEnv.trim() === '') {
    console.error(
      'CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or is empty in your environment variables. Please ensure it is defined correctly in your .env.local file and that you have restarted your development server.'
    );
    throw new Error(
      'Supabase Anon Key is not configured. NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty. Check .env.local and restart server.'
    );
  }

  const supabaseUrl = supabaseUrlFromEnv.trim();
  const supabaseAnonKey = supabaseAnonKeyFromEnv.trim();

  try {
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
        throw new Error(`The Supabase URL must start with http:// or https://. Received: "${supabaseUrl}"`);
    }
    new URL(supabaseUrl); 
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(
      `CRITICAL ERROR: The NEXT_PUBLIC_SUPABASE_URL ("${supabaseUrlFromEnv}") is not a valid URL. Please check its format in .env.local. Specific error: ${errorMessage}`
    );
    throw new Error(
      `The Supabase URL ("${supabaseUrlFromEnv}") is invalid. Please verify it in .env.local. Error: ${errorMessage}`
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
