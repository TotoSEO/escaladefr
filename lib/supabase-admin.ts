import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase server-only avec service_role.
 * À n'utiliser QUE dans des Server Components ou des Route Handlers.
 * Ne jamais exposer la clé côté client.
 */
let cachedAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cachedAdmin) {
    cachedAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedAdmin;
}
