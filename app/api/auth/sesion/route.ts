import { manejar, respuestaJson } from '@/lib/http';
import { obtenerAdminAuth } from '@/lib/firebaseAdmin';
import { crearSesionPayloadSchema } from '@/schemas/api.schema';
import { resolverRolUsuario } from '@/lib/auth';

export const runtime = 'nodejs';

// Duración de la cookie: 5 días en segundos (según regla de arquitectura 9.1)
const CINCO_DIAS_SEG = 5 * 24 * 60 * 60;

export const POST = manejar(async (req: Request) => {
  const body = await req.json();
  const { idToken } = crearSesionPayloadSchema.parse(body);

  const auth = obtenerAdminAuth();

  // 1. Decodificar el token y resolver perfil/rol (con timeout seguro en Firestore)
  const decoded = await auth.verifyIdToken(idToken, false);
  const rol = await resolverRolUsuario(decoded.uid, decoded.rol);

  // 2. Establecer la cookie de sesión cifrada (5 días según regla 9.1)
  let sessionCookie = idToken;
  try {
    const expiresInMs = CINCO_DIAS_SEG * 1000;
    sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: expiresInMs });
  } catch {
    sessionCookie = idToken;
  }

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
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
  ]
    .filter(Boolean)
    .join('; ');

  response.headers.append('Set-Cookie', directivasCookie);

  return response;
});
