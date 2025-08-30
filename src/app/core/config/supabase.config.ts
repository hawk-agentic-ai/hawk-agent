export function getSupabaseEnv() {
  const env = (window as any).__env || {};
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase env missing. Set window.__env SUPABASE_URL and SUPABASE_ANON_KEY in index.html');
  }
  return { url, key };
}

