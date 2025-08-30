import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from '../config/supabase.config';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const { url, key } = getSupabaseEnv();
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      },
      realtime: { params: { eventsPerSecond: 5 } }
    });
  }
  return client;
}
