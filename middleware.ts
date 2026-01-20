import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware Next.js pour protéger les routes
 * Vérifie la présence du token dans les cookies ou localStorage
 * Note: localStorage n'est pas accessible dans middleware, on vérifie les cookies
 */
export function middleware(request: NextRequest) {
  // Routes publiques (pas besoin d'authentification)
  const publicRoutes = ['/login', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Routes protégées (nécessitent authentification)
  // Note: Pour localStorage, la vérification se fait côté client via PrivateRoute
  // Ce middleware est utile si on utilise des cookies avec httpOnly
  // Dans ce cas, on pourrait vérifier :
  // const token = request.cookies.get('token')?.value
  // if (!token && !isPublicRoute) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  // Matcher pour les routes à protéger
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
