import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_EMAILS = ['computacion@emlider.edu.mx', 'coordinacion@emlider.edu.mx', 'direccion@emlider.edu.mx']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const email = session?.user?.email?.toLowerCase() || ''
  const isAllowed = ALLOWED_EMAILS.includes(email)

  // Protect /dashboard routes — must have a session AND be a whitelisted email
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!isAllowed) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Work Hub is admin-only (Computación)
    if (request.nextUrl.pathname.startsWith('/dashboard/workhub') && email !== 'computacion@emlider.edu.mx') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Comentarios is coordinacion/direccion only
    if (request.nextUrl.pathname.startsWith('/dashboard/comentarios') && email === 'computacion@emlider.edu.mx') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect logged-in allowed users away from login
  if (request.nextUrl.pathname === '/login' && session && isAllowed) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
