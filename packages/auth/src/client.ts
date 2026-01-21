import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClientType | null = null;

function getSupabase(): SupabaseClientType {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please check .env file.'
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  }

  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClientType, {
  get: (_target, prop) => {
    const instance = getSupabase();
    const value = instance[prop as keyof SupabaseClientType];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export type SupabaseClient = typeof supabase;
