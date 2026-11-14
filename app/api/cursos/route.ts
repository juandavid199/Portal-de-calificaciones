import { manejar, respuestaJson } from '@/lib/http';
import { requerirUsuario } from '@/lib/auth';
import { consultarCursosParaUsuario, registrarCurso } from '@/services/cursoService';
import { crearCursoPayloadSchema } from '@/schemas/api.schema';

export const runtime = 'nodejs';

export const GET = manejar(async (req: Request) => {
  const usuario = await requerirUsuario(req);
  const cursos = await consultarCursosParaUsuario(usuario.uid, usuario.rol);

  return respuestaJson(
    {
      total: cursos.length,
      cursos,
    },
    200
  );
});

export const POST = manejar(async (req: Request) => {
  const usuario = await requerirUsuario(req, ['admin']);
  const body = await req.json();
  const payload = crearCursoPayloadSchema.parse(body);

  const cursoId = await registrarCurso(
    {
      nombre: payload.nombre,
      docenteUid: payload.docenteUid,
      docenteNombre: payload.docenteNombre,
      periodo: payload.periodo,
      actividades: payload.actividades,
    },
    usuario.rol === 'admin'
  );

  return respuestaJson(
    {
      mensaje: 'Curso académico creado exitosamente',
      id: cursoId,
    },
    201
  );
});
