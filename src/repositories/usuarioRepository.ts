import { obtenerAdminAuth, obtenerAdminDb } from '@/lib/firebaseAdmin';
import type { RolUsuario } from '@/lib/auth';
import type { CrearUsuarioInput } from '@/schemas/usuario.schema';

export interface UsuarioDoc {
  uid: string;
  correo: string;
  nombre: string;
  rol: RolUsuario;
  creadoEn: string;
}

/**
 * Crea un usuario en Firebase Authentication con Custom Claims y persiste su perfil en Firestore.
 */
export async function crearUsuarioAdmin(datos: CrearUsuarioInput): Promise<UsuarioDoc> {
  const auth = obtenerAdminAuth();
  const db = obtenerAdminDb();

  // 1. Crear usuario en Firebase Auth
  const userRecord = await auth.createUser({
    email: datos.correo,
    password: datos.contrasena,
    displayName: datos.nombre,
  });

  // 2. Asignar Custom Claim de Rol de forma inmutable en el token
  await auth.setCustomUserClaims(userRecord.uid, { rol: datos.rol });

  // 3. Persistir en la colección 'usuarios' de Firestore
  const fechaIso = new Date().toISOString();
  const usuarioDoc: UsuarioDoc = {
    uid: userRecord.uid,
    correo: datos.correo,
    nombre: datos.nombre,
    rol: datos.rol,
    creadoEn: fechaIso,
  };

  await db.collection('usuarios').doc(userRecord.uid).set(usuarioDoc);

  return usuarioDoc;
}

/**
 * Retorna todos los usuarios registrados en Firestore sincronizados con Firebase Auth.
 */
export async function listarUsuariosAdmin(): Promise<UsuarioDoc[]> {
  const db = obtenerAdminDb();
  const auth = obtenerAdminAuth();

  const snapshot = await db.collection('usuarios').get();
  const mapaUsuarios = new Map<string, UsuarioDoc>();

  snapshot.docs.forEach((doc) => {
    mapaUsuarios.set(doc.id, doc.data() as UsuarioDoc);
  });

  try {
    const authUsers = await auth.listUsers(100);
    for (const u of authUsers.users) {
      if (!mapaUsuarios.has(u.uid)) {
        const rolClaim = (u.customClaims?.rol as RolUsuario) || 'estudiante';
        const docNuevo: UsuarioDoc = {
          uid: u.uid,
          correo: u.email || '',
          nombre: u.displayName || u.email?.split('@')[0] || 'Usuario',
          rol: rolClaim,
          creadoEn: u.metadata?.creationTime || new Date().toISOString(),
        };
        await db.collection('usuarios').doc(u.uid).set(docNuevo, { merge: true }).catch(() => null);
        mapaUsuarios.set(u.uid, docNuevo);
      }
    }
  } catch {
    // Si no hay permisos de listUsers, retornar los de Firestore
  }

  return Array.from(mapaUsuarios.values());
}

