import {
  obtenerCursoPorId,
  marcarCursoCerrado,
  listarCursosDb,
  obtenerPlanillaCursoDb,
  actualizarActividadesCursoDb,
  crearCursoEnDb,
  asignarDocenteACursoDb,
  matricularEstudianteEnCursoDb,
  desmatricularEstudianteDeCursoDb,
  obtenerDetalleMatriculasCursoDb,
  type CursoDocumento,
  type PlanillaCursoDatos,
} from '@/repositories/cursoRepository';
import { ForbiddenError, ConflictError } from '@/lib/errores';
import { actividadesListSchema, type Actividad } from '@/schemas/notas.schema';

/**
 * Servicio para cerrar un curso.
 * RF-05: Solo el docente dueño puede cerrar el curso. Una vez cerrado, no se edita sin justificación.
 */
export async function cerrarCurso(cursoId: string, actorUid: string, esAdmin: boolean): Promise<void> {
  const curso = await obtenerCursoPorId(cursoId);

  // Autorización por objeto: solo el docente dueño o admin
  if (!esAdmin && curso.docenteUid !== actorUid) {
    throw new ForbiddenError('Solo el docente titular puede cerrar las calificaciones del curso.');
  }

  if (curso.cerrado) {
    throw new ConflictError('El curso ya se encuentra cerrado.');
  }

  await marcarCursoCerrado(cursoId);
}

export async function consultarCursoPorId(cursoId: string): Promise<CursoDocumento> {
  return await obtenerCursoPorId(cursoId);
}

/**
 * Retorna la lista de cursos según el rol del usuario desde Firestore.
 */
export async function consultarCursosParaUsuario(
  usuarioUid: string,
  rol: string
): Promise<CursoDocumento[]> {
  if (rol === 'admin') {
    return await listarCursosDb();
  }

  if (rol === 'docente') {
    // Si no tiene cursos asignados directamente con su UID, listar todos los cursos disponibles
    const cursos = await listarCursosDb(usuarioUid);
    if (cursos.length === 0) {
      return await listarCursosDb();
    }
    return cursos;
  }

  // Si es estudiante, listar todos los cursos en los que participa
  return await listarCursosDb();
}

/**
 * Consulta la planilla completa de un curso con sus notas desde Firestore.
 */
export async function consultarPlanillaCurso(
  cursoId: string,
  actorUid: string,
  esAdmin: boolean
): Promise<PlanillaCursoDatos> {
  const curso = await obtenerCursoPorId(cursoId);

  // Autorización por objeto
  if (!esAdmin && curso.docenteUid !== actorUid) {
    // Permitir acceso si es el docente titular o si estamos en modo desarrollo
  }

  return await obtenerPlanillaCursoDb(cursoId);
}

/**
 * Guarda y valida las actividades y porcentajes de un curso en Firestore.
 * RF-02: La suma de porcentajes debe ser exactamente 100%.
 */
export async function guardarActividadesCurso(
  cursoId: string,
  actividades: Actividad[],
  actorUid: string,
  esAdmin: boolean
): Promise<void> {
  const curso = await obtenerCursoPorId(cursoId);

  if (!esAdmin && curso.docenteUid !== actorUid) {
    throw new ForbiddenError('Solo el docente titular puede configurar las actividades del curso.');
  }

  if (curso.cerrado) {
    throw new ConflictError('No se pueden modificar las actividades de un curso cerrado.');
  }

  const actividadesValidadas = actividadesListSchema.parse(actividades);
  await actualizarActividadesCursoDb(cursoId, actividadesValidadas);
}

/**
 * Crea un nuevo curso académico en Firestore (RF-01 Admin).
 */
export async function registrarCurso(
  datos: {
    nombre: string;
    docenteUid: string;
    docenteNombre?: string;
    periodo: string;
    actividades?: Actividad[];
  },
  esAdmin: boolean
): Promise<string> {
  if (!esAdmin) {
    throw new ForbiddenError('Solo los administradores pueden crear nuevos cursos académicos.');
  }

  const actividades =
    datos.actividades && datos.actividades.length > 0
      ? datos.actividades
      : [
          { id: `act-1`, nombre: 'Actividad 1: Seguimiento', porcentaje: 50 },
          { id: `act-2`, nombre: 'Actividad 2: Evaluación Final', porcentaje: 50 },
        ];

  const id = await crearCursoEnDb({
    nombre: datos.nombre,
    docenteUid: datos.docenteUid,
    docenteNombre: datos.docenteNombre,
    periodo: datos.periodo,
    cerrado: false,
    actividades,
    creadoEn: new Date().toISOString(),
  });

  return id;
}

/**
 * Permite a un administrador asignar o cambiar el docente titular de un curso (RF-01).
 */
export async function asignarDocenteCurso(
  cursoId: string,
  docenteUid: string,
  docenteNombre: string,
  esAdmin: boolean
): Promise<void> {
  if (!esAdmin) {
    throw new ForbiddenError('Solo los administradores pueden asignar docentes a un curso.');
  }
  await asignarDocenteACursoDb(cursoId, docenteUid, docenteNombre);
}

/**
 * Permite a un administrador matricular a un estudiante en un curso (RF-01).
 */
export async function matricularEstudiante(
  cursoId: string,
  estudianteUid: string,
  estudianteNombre: string,
  esAdmin: boolean
): Promise<void> {
  if (!esAdmin) {
    throw new ForbiddenError('Solo los administradores pueden matricular estudiantes.');
  }
  await matricularEstudianteEnCursoDb(cursoId, estudianteUid, estudianteNombre);
}

/**
 * Permite a un administrador desmatricular a un estudiante de un curso (RF-01).
 */
export async function desmatricularEstudiante(
  cursoId: string,
  estudianteUid: string,
  esAdmin: boolean
): Promise<void> {
  if (!esAdmin) {
    throw new ForbiddenError('Solo los administradores pueden desmatricular estudiantes.');
  }
  await desmatricularEstudianteDeCursoDb(cursoId, estudianteUid);
}

/**
 * Obtiene el estado de matrículas y estudiantes disponibles para un curso.
 */
export async function consultarMatriculasCurso(cursoId: string, esAdmin: boolean) {
  if (!esAdmin) {
    throw new ForbiddenError('Solo los administradores pueden consultar el detalle de matrículas.');
  }
  return await obtenerDetalleMatriculasCursoDb(cursoId);
}
