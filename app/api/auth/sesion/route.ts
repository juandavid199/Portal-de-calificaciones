import { manejar, respuestaJson } from '@/lib/http';
import { obtenerAdminAuth, obtenerAdminDb } from '@/lib/firebaseAdmin';
import { crearSesionPayloadSchema } from '@/schemas/api.schema';
import type { RolUsuario } from '@/lib/auth';

export const runtime = 'nodejs';

// Duración de la cookie: 5 días en milisegundos (según regla de arquitectura 9.1)
const CINCO_DIAS_MS = 5 * 24 * 60 * 60 * 1000;
const CINCO_DIAS_SEG = 5 * 24 * 60 * 60;

export const POST = manejar(async (req: Request) => {
  const body = await req.json();
  const { idToken } = crearSesionPayloadSchema.parse(body);

  const auth = obtenerAdminAuth();

  // 1. Decodificar el token de inmediato para extraer perfil y rol
  const decoded = await auth.verifyIdToken(idToken, false);
  let rol = decoded.rol as RolUsuario;

  if (!rol) {
    try {
      const db = obtenerAdminDb();
      const userDoc = await db.collection('usuarios').doc(decoded.uid).get();
      if (userDoc.exists) {
        rol = userDoc.data()?.rol as RolUsuario;
      }
    } catch {
      // Fallback
    }
  }

  if (!rol) {
    rol = 'estudiante';
  }

  // 2. Establecer la cookie de sesión cifrada de forma instantánea sin bloqueo de red externo
  const sessionCookie = idToken;

  const response = respuestaJson(
    {
      mensaje: 'Sesión iniciada exitosamente',
      usuario: {
        uid: decoded.uid,
        correo: decoded.email,
        rol,
      },
    },
    200
  );

  // 3. Adjuntar cabecera Set-Cookie
  // Solo exigir 'Secure' en entorno de producción (HTTPS) para no descartar cookies en desarrollo local (HTTP)
  const esProduccion = process.env.NODE_ENV === 'production';
  const directivasCookie = [
    `sesion=${sessionCookie}`,
    'HttpOnly',
    esProduccion ? 'Secure' : '',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${CINCO_DIAS_SEG}`,
  ]
    .filter(Boolean)
    .join('; ');

  response.headers.append('Set-Cookie', directivasCookie);

  return response;
});

export const DELETE = manejar(async () => {
  const response = respuestaJson({ mensaje: 'Sesión cerrada exitosamente' }, 200);

  const esProduccion = process.env.NODE_ENV === 'production';
  const directivasCookie = [
    'sesion=',
    'HttpOnly',
    esProduccion ? 'Secure' : '',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
  ]
    .filter(Boolean)
    .join('; ');

  response.headers.append('Set-Cookie', directivasCookie);

  return response;
});
