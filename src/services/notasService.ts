import { aplicarTransaccionNotasLote, type ResultadoTransaccionLote } from '@/repositories/notasRepository';
import { obtenerCursoPorId } from '@/repositories/cursoRepository';
import { ForbiddenError } from '@/lib/errores';
import type { CambioNotaItem } from '@/schemas/api.schema';

/**
 * Servicio de negocio para la actualización de notas por lotes.
 * Aplica autorización por objeto (solo el docente dueño o admin puede editar)
 * y delega la transacción atómica con auditoría al repositorio.
 */
export async function actualizarNotasLote(
  cursoId: string,
  actorUid: string,
  esAdmin: boolean,
  cambios: CambioNotaItem[],
  justificacion?: string
): Promise<ResultadoTransaccionLote> {
  const curso = await obtenerCursoPorId(cursoId);

  // Autorización por objeto: El usuario debe ser el docente dueño del curso o admin
  if (!esAdmin && curso.docenteUid !== actorUid) {
    throw new ForbiddenError('Solo el docente asignado a este curso puede modificar sus notas.');
  }

  // Delegar la transacción atómica con verificación de cierre y auditoría
  return await aplicarTransaccionNotasLote(cursoId, actorUid, cambios, justificacion);
}

