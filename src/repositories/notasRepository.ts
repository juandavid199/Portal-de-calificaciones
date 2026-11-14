import { obtenerAdminDb } from '@/lib/firebaseAdmin';
import { NotFoundError, ConflictError } from '@/lib/errores';
import { calcularDefinitivoPonderado, type ActividadPonderada } from '@/services/calculoNotas';
import type { CambioNotaItem } from '@/schemas/api.schema';

export interface NotaEstudianteDocumento {
  estudianteUid: string;
  valores: Record<string, number | null>;
  definitivo: number | null;
  actualizadoEn?: string;
}

export interface ResultadoTransaccionLote {
  cursoId: string;
  modificados: number;
  definitivos: Record<string, number | null>;
}

/**
 * Ejecuta una transacción atómica en Firestore para aplicar un lote de cambios de notas:
 * 1. Lee el documento del curso (actividades y estado de cierre).
 * 2. Verifica si el curso está cerrado y valida la justificación (409 en caso contrario).
 * 3. Lee las notas actuales de cada estudiante afectado.
 * 4. Recalcula el definitivo ponderado con aritmética exacta en décimas.
 * 5. Escribe las notas actualizadas y los registros en auditoriaNotas.
 */
export async function aplicarTransaccionNotasLote(
  cursoId: string,
  actorUid: string,
  cambios: CambioNotaItem[],
  justificacion?: string
): Promise<ResultadoTransaccionLote> {
  const db = obtenerAdminDb();
  const cursoRef = db.collection('cursos').doc(cursoId);

  return await db.runTransaction(async (transaction) => {
    // ----------------------------------------------------
    // FASE 1: TODAS LAS LECTURAS
    // ----------------------------------------------------
    const cursoSnap = await transaction.get(cursoRef);
    if (!cursoSnap.exists) {
      throw new NotFoundError(`El curso con ID "${cursoId}" no fue encontrado.`);
    }

    const cursoData = cursoSnap.data()!;
    const estaCerrado = Boolean(cursoData.cerrado);

    // Validación crítica de regla de negocio RF-05 / Criterio 2:
    if (estaCerrado && (!justificacion || justificacion.trim().length < 5)) {
      throw new ConflictError(
        'El curso está cerrado. Se requiere una justificación válida para editar notas.'
      );
    }

    const actividades: ActividadPonderada[] = (cursoData.actividades || []).map((a: { id: string; porcentaje: number }) => ({
      id: a.id,
      porcentaje: a.porcentaje,
    }));

    // Agrupar cambios por estudiante
    const cambiosPorEstudiante = new Map<string, CambioNotaItem[]>();
    for (const cambio of cambios) {
      const lista = cambiosPorEstudiante.get(cambio.estudianteUid) || [];
      lista.push(cambio);
      cambiosPorEstudiante.set(cambio.estudianteUid, lista);
    }

    // Leer notas previas de todos los estudiantes afectados dentro de la transacción
    const notasPreviasMap = new Map<string, Record<string, number | null>>();
    const notasRefsMap = new Map<string, FirebaseFirestore.DocumentReference>();

    for (const estudianteUid of cambiosPorEstudiante.keys()) {
      const notaRef = cursoRef.collection('notas').doc(estudianteUid);
      notasRefsMap.set(estudianteUid, notaRef);

      const notaSnap = await transaction.get(notaRef);
      if (notaSnap.exists) {
        const data = notaSnap.data()!;
        notasPreviasMap.set(estudianteUid, (data.valores as Record<string, number | null>) || {});
      } else {
        notasPreviasMap.set(estudianteUid, {});
      }
    }

    // ----------------------------------------------------
    // FASE 2: TODAS LAS ESCRITURAS (Commit atómico)
    // ----------------------------------------------------
    const ahoraIso = new Date().toISOString();
    const nuevosDefinitivos: Record<string, number | null> = {};

    for (const [estudianteUid, listaCambios] of cambiosPorEstudiante.entries()) {
      const notaRef = notasRefsMap.get(estudianteUid)!;
      const notasActuales = { ...(notasPreviasMap.get(estudianteUid) || {}) };

      for (const c of listaCambios) {
        const valorAnterior = notasActuales[c.actividadId] ?? null;
        const valorNuevo = c.valor;

        notasActuales[c.actividadId] = valorNuevo;

        // Registrar auditoría por cada modificación efectiva
        const auditoriaRef = db.collection('auditoriaNotas').doc();
        transaction.set(auditoriaRef, {
          cursoId,
          estudianteUid,
          actividadId: c.actividadId,
          antes: valorAnterior,
          despues: valorNuevo,
          actorUid,
          justificacion: justificacion || null,
          creadoEn: ahoraIso,
        });
      }

      // Recalcular definitivo con la lógica matemática pura
      const nuevoDefinitivo = calcularDefinitivoPonderado(actividades, notasActuales);
      nuevosDefinitivos[estudianteUid] = nuevoDefinitivo;

      // Escribir fila de notas consolidada
      transaction.set(notaRef, {
        estudianteUid,
        valores: notasActuales,
        definitivo: nuevoDefinitivo,
        actualizadoEn: ahoraIso,
      });
    }

    return {
      cursoId,
      modificados: cambios.length,
      definitivos: nuevosDefinitivos,
    };
  });
}

/**
 * Obtiene las notas de un estudiante en un curso específico.
 */
export async function obtenerNotasEstudianteEnCurso(
  cursoId: string,
  estudianteUid: string
): Promise<NotaEstudianteDocumento | null> {
  const db = obtenerAdminDb();
  const doc = await db.collection('cursos').doc(cursoId).collection('notas').doc(estudianteUid).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;
  return {
    estudianteUid,
    valores: data.valores || {},
    definitivo: data.definitivo ?? null,
    actualizadoEn: data.actualizadoEn,
  };
}

