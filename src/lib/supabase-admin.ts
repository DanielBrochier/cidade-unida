import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service role key.
 * Never import this from a Client Component — it bypasses Row Level Security.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase ainda não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local (veja .env.example)."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}

export const FOTOS_BUCKET = "fotos";
