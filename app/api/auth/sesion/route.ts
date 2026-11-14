import { manejar, respuestaJson } from '@/lib/http';
import { obtenerAdminAuth } from '@/lib/firebaseAdmin';
import { crearSesionPayloadSchema } from '@/schemas/api.schema';

export const runtime = 'nodejs';

// Duración de la cookie: 5 días en milisegundos (según regla de arquitectura 9.1)
const CINCO_DIAS_MS = 5 * 24 * 60 * 60 * 1000;
const CINCO_DIAS_SEG = 5 * 24 * 60 * 60;

export const POST = manejar(async (req: Request) => {
  const body = await req.json();
  const { idToken } = crearSesionPayloadSchema.parse(body);

  const auth = obtenerAdminAuth();

  // Crear la cookie de sesión cifrada por Firebase
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: CINCO_DIAS_MS,
  });

  const response = respuestaJson({ mensaje: 'Sesión iniciada exitosamente' }, 200);

  // Adjuntar cabecera Set-Cookie con directivas de seguridad estrictas
  response.headers.append(
    'Set-Cookie',
    `sesion=${sessionCookie}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${CINCO_DIAS_SEG}`
  );

  return response;
});

export const DELETE = manejar(async () => {
  const response = respuestaJson({ mensaje: 'Sesión cerrada exitosamente' }, 200);

  // Borrar la cookie
  response.headers.append(
    'Set-Cookie',
    'sesion=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
  );

  return response;
});

