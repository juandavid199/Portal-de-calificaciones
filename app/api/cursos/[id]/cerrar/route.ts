import { manejar, respuestaJson } from '@/lib/http';
import { requerirUsuario } from '@/lib/auth';
import { cerrarCursoPayloadSchema } from '@/schemas/api.schema';
import { cerrarCurso } from '@/services/cursoService';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = manejar(async (req: Request, ctx: RouteContext) => {
  const usuario = await requerirUsuario(req, ['docente', 'admin']);
  const params = await ctx.params;
  const cursoId = params.id;

  const body = await req.json();
  cerrarCursoPayloadSchema.parse(body);

  await cerrarCurso(cursoId, usuario.uid, usuario.rol === 'admin');

  return respuestaJson(
    {
      mensaje: `El curso "${cursoId}" ha sido cerrado exitosamente. En adelante requerirá justificación para editar notas.`,
    },
    200
  );
});

