import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware Next.js pour protéger les routes et gérer HTTP/HTTPS
 * 
 * STRATÉGIE HTTP/HTTPS pour portail captif MikroTik :
 * - Routes publiques (/login, /forgot-password, /reset-password) : HTTP accepté
 * - Routes protégées : HTTPS forcé (après authentification)
 * 
 * Cela permet au portail captif de rediriger vers HTTP avant login,
 * puis on force HTTPS après authentification pour la sécurité.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const isHttps = request.headers.get('x-forwarded-proto') === 'https' || 
                   url.protocol === 'https:'
  
  // Routes publiques (pas besoin d'authentification)
  // Ces routes acceptent HTTP pour le portail captif MikroTik
  const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/captive']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si c'est une route publique, laisser passer (HTTP ou HTTPS)
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Routes protégées : FORCER HTTPS
  // Après authentification, on doit être en HTTPS pour la sécurité
  if (!isHttps && process.env.NODE_ENV === 'production') {
    url.protocol = 'https:'
    return NextResponse.redirect(url)
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
