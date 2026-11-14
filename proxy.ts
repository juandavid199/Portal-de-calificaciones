import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy / Middleware de navegación de Next.js (Edge):
 * - Redirige a /login si falta la cookie 'sesion' en rutas protegidas.
 * - NOTA DE ARQUITECTURA: Este proxy es una mejora de experiencia de usuario (UX).
 *   La seguridad real y criptográfica se valida en cada Route Handler con requerirUsuario().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieSesion = request.cookies.get('sesion');

  // Comprobar si es una ruta protegida
  const esRutaProtegida =
    pathname.startsWith('/estudiante') ||
    pathname.startsWith('/docente') ||
    pathname.startsWith('/admin');

  if (esRutaProtegida && !cookieSesion?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/estudiante/:path*',
    '/docente/:path*',
    '/admin/:path*',
  ],
};

export default proxy;

