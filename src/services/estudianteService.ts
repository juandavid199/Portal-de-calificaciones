import { obtenerAdminDb } from '@/lib/firebaseAdmin';

export interface NotaCursoEstudianteDto {
  cursoId: string;
  cursoNombre: string;
  periodo: string;
  cerrado: boolean;
  actividades: { id: string; nombre: string; porcentaje: number }[];
  valores: Record<string, number | null>;
  definitivo: number | null;
}

/**
 * Consulta de notas exclusivas del estudiante autenticado.
 * Criterio 1: Un estudiante solo ve sus propias notas; nunca las de otro.
 */
export async function consultarNotasEstudiante(estudianteUid: string): Promise<NotaCursoEstudianteDto[]> {
  const db = obtenerAdminDb();

  // Buscar todos los cursos
  const cursosSnap = await db.collection('cursos').get();
  const resultados: NotaCursoEstudianteDto[] = [];

  for (const cursoDoc of cursosSnap.docs) {
    const cursoData = cursoDoc.data();
    const cursoId = cursoDoc.id;

    // Verificar si el estudiante tiene notas o matrícula en este curso
    const notaDoc = await db.collection('cursos').doc(cursoId).collection('notas').doc(estudianteUid).get();

    if (notaDoc.exists) {
      const notaData = notaDoc.data()!;
      resultados.push({
        cursoId,
        cursoNombre: cursoData.nombre,
        periodo: cursoData.periodo,
        cerrado: Boolean(cursoData.cerrado),
        actividades: cursoData.actividades || [],
        valores: notaData.valores || {},
        definitivo: notaData.definitivo ?? null,
      });
    }
  }

  return resultados;
}

