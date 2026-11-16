import { obtenerAdminAuth, obtenerAdminDb } from './firebaseAdmin';
import { UnauthorizedError, ForbiddenError } from './errores';

export type RolUsuario = 'docente' | 'estudiante' | 'admin';

export interface UsuarioAutenticado {
  uid: string;
  correo?: string;
  rol: RolUsuario;
}

/**
 * Resuelve el rol del usuario desde el Custom Claim del token o, como respaldo con timeout,
 * desde la colección 'usuarios' de Firestore.
 */
export async function resolverRolUsuario(uid: string, claimRol: unknown): Promise<RolUsuario> {
  if (claimRol === 'admin' || claimRol === 'docente' || claimRol === 'estudiante') {
    return claimRol;
  }

  try {
    const db = obtenerAdminDb();
    const consultaFirestore = db.collection('usuarios').doc(uid).get();
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    const userDoc = await Promise.race([consultaFirestore, timeout]);

    if (userDoc && userDoc.exists) {
      const rolDb = userDoc.data()?.rol;
      if (rolDb === 'admin' || rolDb === 'docente' || rolDb === 'estudiante') {
        return rolDb;
      }
    }
  } catch {
    // Fallback silencioso a 'estudiante'
  }

  return 'estudiante';
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
      // Validar cookie mediante verificación criptográfica local ultra-rápida (primero idToken, luego sessionCookie)
      try {
        decodedToken = await auth.verifyIdToken(tokenOId, false);
      } catch {
        decodedToken = await auth.verifySessionCookie(tokenOId, false);
      }
    } else {
      // Validar idToken directo
      decodedToken = await auth.verifyIdToken(tokenOId, false);
    }

    const rol = await resolverRolUsuario(decodedToken.uid, decodedToken.rol);

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

