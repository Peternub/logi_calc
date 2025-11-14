import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'

// Проверяем наличие переменных окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Клиент для браузера (client components)
export function createClient() {
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  )
}

// Клиент для сервера (server components)
export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Игнорируем ошибки при установке cookies в Server Components
          }
        },
      },
    }
  )
}

// Middleware клиент
export function createMiddlewareClient(request: Request) {
  let response = new Response()

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')?.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=')
            return { name, value: rest.join('=') }
          }) || []
        },
        setAll(cookiesToSet) {
          response = new Response(response.body, response)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.headers.append('Set-Cookie', `${name}=${value}; ${Object.entries(options || {}).map(([k, v]) => `${k}=${v}`).join('; ')}`)
          })
        },
      },
    }
  )

  return { supabase, response }
}