import { obtenerAdminAuth, obtenerAdminDb } from './firebaseAdmin';
import { UnauthorizedError, ForbiddenError } from './errores';

export type RolUsuario = 'docente' | 'estudiante' | 'admin';

export interface UsuarioAutenticado {
  uid: string;
  correo?: string;
  rol: RolUsuario;
}

/**
 * Extrae y valida la sesión del usuario a partir de la cookie de sesión HttpOnly ('sesion')
 * o de la cabecera 'Authorization: Bearer <idToken>'.
 *
 * @param request Objeto Request de Next.js
 * @param rolesPermitidos Lista opcional de roles admitidos para la operación
 * @returns UsuarioAutenticado { uid, correo, rol }
 */
export async function requerirUsuario(
  request: Request,
  rolesPermitidos?: RolUsuario[]
): Promise<UsuarioAutenticado> {
  let tokenOId: string | null = null;
  let esCookie = false;

  // 1. Extraer cookie 'sesion'
  const cookieHeader = request.headers.get('cookie') || '';
  const matchCookie = cookieHeader.match(/(?:^|;\s*)sesion=([^;]+)/);
  if (matchCookie) {
    tokenOId = decodeURIComponent(matchCookie[1]!);
    esCookie = true;
  }

  // 2. Extraer cabecera Authorization (para pruebas de API / Bruno)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    tokenOId = authHeader.substring(7).trim();
    esCookie = false;
  }

  if (!tokenOId) {
    throw new UnauthorizedError('Se requiere una sesión activa o un token Bearer válido.');
  }

  try {
    const auth = obtenerAdminAuth();
    let decodedToken;

    if (esCookie) {
      // Validar cookie de sesión mediante verificación criptográfica local ultra-rápida
      decodedToken = await auth.verifySessionCookie(tokenOId, false);
    } else {
      // Validar idToken directo
      decodedToken = await auth.verifyIdToken(tokenOId, false);
    }

    let rol: RolUsuario = (decodedToken.rol as RolUsuario);

    // Si el token aún no tiene el Custom Claim, consultar perfil en Firestore 'usuarios'
    if (!rol) {
      try {
        const db = obtenerAdminDb();
        const userDoc = await db.collection('usuarios').doc(decodedToken.uid).get();
        if (userDoc.exists) {
          rol = userDoc.data()?.rol as RolUsuario;
        }
      } catch {
        // Silencioso
      }
    }

    if (!rol) {
      rol = 'estudiante';
    }

    const usuario: UsuarioAutenticado = {
      uid: decodedToken.uid,
      correo: decodedToken.email,
      rol,
    };

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
      throw new ForbiddenError(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}.`
      );
    }

    return usuario;
  } catch (err: unknown) {
    if (err instanceof ForbiddenError) {
      throw err;
    }
    throw new UnauthorizedError('La sesión o el token proporcionado ha expirado o es inválido.');
  }
}

