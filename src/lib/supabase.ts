import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client for GLINDA — read-only season schedule and standings.
 *
 * Reads from `import.meta.env`:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY
 *
 * Returns null if either variable is missing — the app renders an error state.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
