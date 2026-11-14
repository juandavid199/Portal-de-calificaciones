import { manejar, respuestaJson } from '@/lib/http';
import { requerirUsuario } from '@/lib/auth';
import { consultarNotasEstudiante } from '@/services/estudianteService';

export const runtime = 'nodejs';

export const GET = manejar(async (req: Request) => {
  // Criterio 1: El UID sale siempre del token autenticado; nunca del body ni de la query string
  const usuario = await requerirUsuario(req);

  const notas = await consultarNotasEstudiante(usuario.uid);

  return respuestaJson(
    {
      estudianteUid: usuario.uid,
      totalCursos: notas.length,
      items: notas,
    },
    200
  );
});

