import { manejar, respuestaJson } from '@/lib/http';
import { requerirUsuario } from '@/lib/auth';
import { actualizarNotasPayloadSchema } from '@/schemas/api.schema';
import { actualizarNotasLote } from '@/services/notasService';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const PUT = manejar(async (req: Request, ctx: RouteContext) => {
  // 1. Requerir autenticación con rol docente o admin
  const usuario = await requerirUsuario(req, ['docente', 'admin']);

  // 2. Resolver parámetros de ruta
  const params = await ctx.params;
  const cursoId = params.id;

  // 3. Validar cuerpo de la petición con esquema Zod estricto
  const body = await req.json();
  const payload = actualizarNotasPayloadSchema.parse(body);

  // 4. Delegar la transacción atómica al servicio de notas
  const resultado = await actualizarNotasLote(
    cursoId,
    usuario.uid,
    usuario.rol === 'admin',
    payload.cambios,
    payload.justificacion
  );

  return respuestaJson(
    {
      mensaje: 'Notas actualizadas exitosamente',
      ...resultado,
    },
    200
  );
});

