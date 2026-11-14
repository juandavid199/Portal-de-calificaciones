import { manejar, respuestaJson } from '@/lib/http';
import { requerirUsuario } from '@/lib/auth';

export const runtime = 'nodejs';

export const GET = manejar(async (req: Request) => {
  const usuario = await requerirUsuario(req);

  return respuestaJson(
    {
      usuario: {
        uid: usuario.uid,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    },
    200
  );
});

