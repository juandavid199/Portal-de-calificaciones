import { obtenerCursoPorId, marcarCursoCerrado, type CursoDocumento } from '@/repositories/cursoRepository';
import { ForbiddenError, ConflictError } from '@/lib/errores';

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

