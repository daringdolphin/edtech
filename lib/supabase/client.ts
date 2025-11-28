/*
<ai_context>
Creates a Supabase client for use in client components (browser-side).
Uses the singleton pattern to ensure only one client instance exists.
</ai_context>
*/

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}



