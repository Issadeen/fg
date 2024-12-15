import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Try to refresh the session
    await supabase.auth.getSession()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log('🔒 Auth State:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      user: session?.user?.email,
      checkingPath: req.nextUrl.pathname.startsWith('/dashboard'),
      cookies: req.cookies.getAll()
    })

    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('from', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (session && ['/login', '/signup'].includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('🔥 Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
}

