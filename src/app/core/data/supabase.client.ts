import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from '../config/supabase.config';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    try {
      const { url, key } = getSupabaseEnv();
      client = createClient(url, key, {
        auth: {
          // Disable session persistence/refresh in dev to avoid LockManager usage
          // and related errors ("n.lock is not a function" or lock acquisition failures)
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        realtime: { params: { eventsPerSecond: 5 } },
        global: {
          fetch: (url, options = {}) => {
            // Add timeout to prevent hanging requests
            return fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
          }
        }
      });
    } catch (error) {
      console.warn('Failed to initialize Supabase client:', error);
      throw new Error('Supabase connection unavailable');
    }
  }
  return client;
}
