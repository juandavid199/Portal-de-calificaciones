import { obtenerAdminDb } from '@/lib/firebaseAdmin';
import { NotFoundError } from '@/lib/errores';
import type { Actividad } from '@/schemas/notas.schema';

export interface CursoDocumento {
  id: string;
  nombre: string;
  docenteUid: string;
  periodo: string;
  cerrado: boolean;
  actividades: Actividad[];
  creadoEn: string;
}

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
    periodo: data.periodo,
    cerrado: Boolean(data.cerrado),
    actividades: data.actividades || [],
    creadoEn: data.creadoEn || new Date().toISOString(),
  };
}

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

export async function crearCursoEnDb(curso: Omit<CursoDocumento, 'id'>): Promise<string> {
  const db = obtenerAdminDb();
  const ref = await db.collection('cursos').add(curso);
  return ref.id;
}

