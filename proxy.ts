import { NextResponse, type NextRequest } from 'next/server';

/**
 * Valida si un JWT está expirado o malformado examinando su payload 'exp'
 * sin requerir dependencias pesadas en el Edge Runtime de Next.js.
 */
function esTokenExpiradoOInvalido(token: string): boolean {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return true;
    let payloadBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payloadBase64.length % 4) {
      payloadBase64 += '=';
    }
    const jsonStr = atob(payloadBase64);
    const payload = JSON.parse(jsonStr);
    if (!payload.exp) return false;
    const ahoraSegundos = Math.floor(Date.now() / 1000);
    // Si ya expiró o expira en menos de 5 segundos
    return payload.exp <= ahoraSegundos + 5;
  } catch {
    return true;
  }
}

/**
 * Proxy / Middleware de navegación de Next.js (Edge):
 * - BLOQUEO TOTAL: Ninguna vista protegida puede ser visualizada sin sesión activa y vigente.
 * - Si el token de sesión ha expirado o es inválido, limpia la cookie y redirige de inmediato a /login.
 * - NUNCA atrapa al usuario en loops de redirección entre / y /login.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieSesion = request.cookies.get('sesion');
  const tokenValido = Boolean(cookieSesion?.value && !esTokenExpiradoOInvalido(cookieSesion.value));

  // Rutas públicas exceptuadas
  const esRutaPublica =
    pathname === '/login' ||
    pathname === '/_not-found' ||
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico';

  // 1. Si NO tiene un token válido y busca acceder a cualquier página protegida:
  if (!tokenValido && !esRutaPublica && !pathname.startsWith('/api')) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    // Eliminar la cookie inválida o expirada para romper cualquier loop
    if (cookieSesion) {
      response.cookies.delete('sesion');
    }
    return response;
  }

  // 2. Si el usuario intenta ir a /login:
  if (pathname === '/login') {
    // Si viene de cerrar sesión explícitamente (?logout=true), limpiar cookie y mostrar login
    if (request.nextUrl.searchParams.get('logout') === 'true') {
      const response = NextResponse.next();
      response.cookies.delete('sesion');
      return response;
    }

    // Si la cookie existe pero el token ya expiró, limpiarla y permitirle ver /login
    if (cookieSesion && !tokenValido) {
      const response = NextResponse.next();
      response.cookies.delete('sesion');
      return response;
    }
    // Si y solo si el token es 100% válido y vigente, redirigir al inicio
    if (tokenValido) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_not-found|favicon.ico).*)'],
};

export default proxy;
