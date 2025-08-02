import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('authenticated')?.value === 'true'
  const userRole = request.cookies.get('userRole')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'
  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Define restricted routes for limited users
  const restrictedRoutes = ['/tickets', '/badges', '/generate']
  const isRestrictedRoute = restrictedRoutes.some(route => pathname.startsWith(route))

  // Check if limited user is trying to access restricted routes
  if (isAuthenticated && userRole === 'limited' && isRestrictedRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}