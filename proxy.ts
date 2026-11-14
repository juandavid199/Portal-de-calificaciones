import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy / Middleware de navegación de Next.js (Edge):
 * - BLOQUEO TOTAL: Ninguna vista puede ser visualizada sin iniciar sesión.
 * - Toda ruta (incluyendo '/') redirige inmediatamente a /login si no hay cookie de sesión activa.
 * - Si el usuario ya tiene sesión activa e ingresa a /login, es redirigido a '/'.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieSesion = request.cookies.get('sesion');
  const estaAutenticado = Boolean(cookieSesion?.value);

  // Rutas públicas exceptuadas
  const esRutaPublica =
    pathname === '/login' ||
    pathname === '/_not-found' ||
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico';

  // 1. Si NO está autenticado y busca acceder a cualquier página o vista de la app:
  if (!estaAutenticado && !esRutaPublica && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si YA está autenticado e intenta ir a la pantalla de login:
  if (estaAutenticado && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_not-found|favicon.ico).*)'],
};

export default proxy;
