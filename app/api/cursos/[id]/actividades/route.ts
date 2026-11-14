import { manejar, respuestaJson } from '@/lib/http';
import { requerirUsuario } from '@/lib/auth';
import { consultarCursoPorId, guardarActividadesCurso } from '@/services/cursoService';
import { actividadesListSchema } from '@/schemas/notas.schema';
import { z } from 'zod';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const actualizarActividadesBodySchema = z.union([
  actividadesListSchema,
  z.object({
    actividades: actividadesListSchema,
  }),
]);

export const GET = manejar(async (req: Request, ctx: RouteContext) => {
  await requerirUsuario(req, ['docente', 'admin']);
  const params = await ctx.params;
  const cursoId = params.id;

  const curso = await consultarCursoPorId(cursoId);

  return respuestaJson(
    {
      cursoId: curso.id,
      nombre: curso.nombre,
      cerrado: curso.cerrado,
      actividades: curso.actividades,
    },
    200
  );
});

export const PUT = manejar(async (req: Request, ctx: RouteContext) => {
  const usuario = await requerirUsuario(req, ['docente', 'admin']);
  const params = await ctx.params;
  const cursoId = params.id;

  const body = await req.json();
  const parsed = actualizarActividadesBodySchema.parse(body);
  const actividades = Array.isArray(parsed) ? parsed : parsed.actividades;

  await guardarActividadesCurso(
    cursoId,
    actividades,
    usuario.uid,
    usuario.rol === 'admin'
  );

  return respuestaJson(
    {
      mensaje: 'Actividades evaluativas actualizadas exitosamente',
      actividades,
    },
    200
  );
});
