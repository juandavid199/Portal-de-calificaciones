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
 * Retorna todos los usuarios registrados en Firestore.
 */
export async function listarUsuariosAdmin(): Promise<UsuarioDoc[]> {
  const db = obtenerAdminDb();
  const snapshot = await db.collection('usuarios').get();
  return snapshot.docs.map((doc) => doc.data() as UsuarioDoc);
}

