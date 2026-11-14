import { obtenerAdminDb } from '@/lib/firebaseAdmin';
import { NotFoundError } from '@/lib/errores';
import type { Actividad } from '@/schemas/notas.schema';

export interface CursoDocumento {
  id: string;
  nombre: string;
  docenteUid: string;
  docenteNombre?: string;
  periodo: string;
  cerrado: boolean;
  actividades: Actividad[];
  creadoEn: string;
}

export interface PlanillaEstudiante {
  uid: string;
  nombre: string;
  notas: Record<string, number | null>;
  definitivo?: number | null;
}

export interface PlanillaCursoDatos {
  curso: string;
  cerrado: boolean;
  actividades: Actividad[];
  estudiantes: PlanillaEstudiante[];
}

/**
 * Obtiene un curso por su ID desde Firestore.
 */
export async function obtenerCursoPorId(id: string): Promise<CursoDocumento> {
  const db = obtenerAdminDb();
  const doc = await db.collection('cursos').doc(id).get();

  if (!doc.exists) {
    throw new NotFoundError(`El curso con ID "${id}" no existe.`);
  }

  const data = doc.data()!;
  return {
    id: doc.id,
    nombre: data.nombre,
    docenteUid: data.docenteUid,
    docenteNombre: data.docenteNombre || data.docente || 'Docente asignado',
    periodo: data.periodo,
    cerrado: Boolean(data.cerrado),
    actividades: data.actividades || [],
    creadoEn: data.creadoEn || new Date().toISOString(),
  };
}

/**
 * Lista cursos de Firestore con filtro opcional de docente.
 */
export async function listarCursosDb(filtroDocenteUid?: string): Promise<CursoDocumento[]> {
  const db = obtenerAdminDb();
  let query: FirebaseFirestore.Query = db.collection('cursos');

  if (filtroDocenteUid) {
    query = query.where('docenteUid', '==', filtroDocenteUid);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data.nombre,
      docenteUid: data.docenteUid,
      docenteNombre: data.docenteNombre || data.docente || 'Docente asignado',
      periodo: data.periodo,
      cerrado: Boolean(data.cerrado),
      actividades: data.actividades || [],
      creadoEn: data.creadoEn || new Date().toISOString(),
    };
  });
}

/**
 * Obtiene la planilla completa del curso y las notas de los estudiantes desde Firestore.
 */
export async function obtenerPlanillaCursoDb(cursoId: string): Promise<PlanillaCursoDatos> {
  const curso = await obtenerCursoPorId(cursoId);
  const db = obtenerAdminDb();

  const notasSnapshot = await db
    .collection('cursos')
    .doc(cursoId)
    .collection('notas')
    .get();

  const estudiantes: PlanillaEstudiante[] = notasSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      nombre: data.nombre || `Estudiante (${doc.id.substring(0, 6)})`,
      notas: data.valores || {},
      definitivo: data.definitivo ?? null,
    };
  });

  return {
    curso: curso.nombre,
    cerrado: curso.cerrado,
    actividades: curso.actividades,
    estudiantes,
  };
}

/**
 * Actualiza las actividades y porcentajes de un curso en Firestore.
 */
export async function actualizarActividadesCursoDb(
  cursoId: string,
  actividades: Actividad[]
): Promise<void> {
  const db = obtenerAdminDb();
  const cursoRef = db.collection('cursos').doc(cursoId);
  const doc = await cursoRef.get();

  if (!doc.exists) {
    throw new NotFoundError(`El curso con ID "${cursoId}" no existe.`);
  }

  await cursoRef.update({
    actividades,
    actualizadoEn: new Date().toISOString(),
  });
}

/**
 * Marca un curso como cerrado en Firestore.
 */
export async function marcarCursoCerrado(id: string): Promise<void> {
  const db = obtenerAdminDb();
  const cursoRef = db.collection('cursos').doc(id);
  const doc = await cursoRef.get();

  if (!doc.exists) {
    throw new NotFoundError(`El curso con ID "${id}" no existe.`);
  }

  await cursoRef.update({
    cerrado: true,
    cerradoEn: new Date().toISOString(),
  });
}

/**
 * Crea un nuevo curso en Firestore (RF-01 Admin).
 */
export async function crearCursoEnDb(curso: Omit<CursoDocumento, 'id'>): Promise<string> {
  const db = obtenerAdminDb();
  const ref = await db.collection('cursos').add(curso);
  return ref.id;
}
