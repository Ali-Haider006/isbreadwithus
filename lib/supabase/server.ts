import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

type CookieStore = {
  getAll: () => { name: string; value: string }[]
  set: (name: string, value: string, options?: CookieOptions) => void
}

export const createClient = (cookieStore: CookieStore) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
