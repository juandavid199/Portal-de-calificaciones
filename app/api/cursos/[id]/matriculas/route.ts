import { manejar, respuestaJson } from '@/lib/http';
import { requerirUsuario } from '@/lib/auth';
import {
  consultarMatriculasCurso,
  matricularEstudiante,
  desmatricularEstudiante,
  asignarDocenteCurso,
} from '@/services/cursoService';
import { z } from 'zod';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const matricularEstudianteSchema = z.object({
  estudianteUid: z.string().min(1, 'El UID del estudiante es obligatorio'),
  estudianteNombre: z.string().optional(),
});

const asignarDocenteSchema = z.object({
  docenteUid: z.string().min(1, 'El UID del docente es obligatorio'),
  docenteNombre: z.string().optional(),
});

export const GET = manejar(async (req: Request, ctx: RouteContext) => {
  const usuario = await requerirUsuario(req, ['admin']);
  const params = await ctx.params;
  const cursoId = params.id;

  const detalle = await consultarMatriculasCurso(cursoId, usuario.rol === 'admin');
  return respuestaJson(detalle, 200);
});

export const POST = manejar(async (req: Request, ctx: RouteContext) => {
  const usuario = await requerirUsuario(req, ['admin']);
  const params = await ctx.params;
  const cursoId = params.id;

  const body = await req.json();
  const payload = matricularEstudianteSchema.parse(body);

  await matricularEstudiante(
    cursoId,
    payload.estudianteUid,
    payload.estudianteNombre || 'Estudiante',
    usuario.rol === 'admin'
  );

  return respuestaJson({ mensaje: 'Estudiante matriculado exitosamente en el curso.' }, 201);
});

export const DELETE = manejar(async (req: Request, ctx: RouteContext) => {
  const usuario = await requerirUsuario(req, ['admin']);
  const params = await ctx.params;
  const cursoId = params.id;

  const url = new URL(req.url);
  const estudianteUidQuery = url.searchParams.get('estudianteUid');

  let estudianteUid = estudianteUidQuery;
  if (!estudianteUid) {
    const body = await req.json().catch(() => ({}));
    estudianteUid = body.estudianteUid;
  }

  if (!estudianteUid) {
    return respuestaJson({ error: 'El estudianteUid es obligatorio' }, 400);
  }

  await desmatricularEstudiante(cursoId, estudianteUid, usuario.rol === 'admin');
  return respuestaJson({ mensaje: 'Estudiante desmatriculado exitosamente.' }, 200);
});

export const PATCH = manejar(async (req: Request, ctx: RouteContext) => {
  const usuario = await requerirUsuario(req, ['admin']);
  const params = await ctx.params;
  const cursoId = params.id;

  const body = await req.json();
  const payload = asignarDocenteSchema.parse(body);

  await asignarDocenteCurso(
    cursoId,
    payload.docenteUid,
    payload.docenteNombre || 'Docente titular',
    usuario.rol === 'admin'
  );

  return respuestaJson({ mensaje: 'Docente asignado exitosamente al curso.' }, 200);
});
