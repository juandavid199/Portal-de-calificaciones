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
  matriculados?: number;
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
 * Lista cursos de Firestore con filtro opcional de docente y conteo real de matriculados.
 */
export async function listarCursosDb(filtroDocenteUid?: string): Promise<CursoDocumento[]> {
  const db = obtenerAdminDb();
  let query: FirebaseFirestore.Query = db.collection('cursos');

  if (filtroDocenteUid) {
    query = query.where('docenteUid', '==', filtroDocenteUid);
  }

  const snapshot = await query.get();
  const cursos = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const notasSnapshot = await doc.ref.collection('notas').get();
      return {
        id: doc.id,
        nombre: data.nombre,
        docenteUid: data.docenteUid,
        docenteNombre: data.docenteNombre || data.docente || 'Docente asignado',
        periodo: data.periodo,
        cerrado: Boolean(data.cerrado),
        actividades: data.actividades || [],
        matriculados: notasSnapshot.size,
        creadoEn: data.creadoEn || new Date().toISOString(),
      };
    })
  );

  return cursos;
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

  // Si no hay estudiantes en la subcolección, auto-descubrir estudiantes registrados en Firestore
  if (estudiantes.length === 0) {
    try {
      const usuariosSnapshot = await db
        .collection('usuarios')
        .where('rol', '==', 'estudiante')
        .get();

      for (const uDoc of usuariosSnapshot.docs) {
        const uData = uDoc.data();
        const nuevoEst: PlanillaEstudiante = {
          uid: uDoc.id,
          nombre: uData.nombre || uData.correo || 'Estudiante',
          notas: {},
          definitivo: null,
        };
        estudiantes.push(nuevoEst);

        // Guardar registro base en la subcolección de notas
        await db
          .collection('cursos')
          .doc(cursoId)
          .collection('notas')
          .doc(uDoc.id)
          .set(
            {
              estudianteUid: uDoc.id,
              nombre: nuevoEst.nombre,
              valores: {},
              definitivo: null,
              actualizadoEn: new Date().toISOString(),
            },
            { merge: true }
          )
          .catch(() => null);
      }
    } catch {
      // Continuar con lista actual
    }
  }

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

/**
 * Reasigna el docente titular de un curso en Firestore.
 */
export async function asignarDocenteACursoDb(
  cursoId: string,
  docenteUid: string,
  docenteNombre: string
): Promise<void> {
  const db = obtenerAdminDb();
  const cursoRef = db.collection('cursos').doc(cursoId);
  const doc = await cursoRef.get();

  if (!doc.exists) {
    throw new NotFoundError(`El curso con ID "${cursoId}" no existe.`);
  }

  await cursoRef.update({
    docenteUid,
    docenteNombre,
    actualizadoEn: new Date().toISOString(),
  });
}

/**
 * Matricula a un estudiante en un curso en Firestore.
 */
export async function matricularEstudianteEnCursoDb(
  cursoId: string,
  estudianteUid: string,
  estudianteNombre: string
): Promise<void> {
  const db = obtenerAdminDb();
  const cursoRef = db.collection('cursos').doc(cursoId);
  const doc = await cursoRef.get();

  if (!doc.exists) {
    throw new NotFoundError(`El curso con ID "${cursoId}" no existe.`);
  }

  const notaDocRef = cursoRef.collection('notas').doc(estudianteUid);
  await notaDocRef.set(
    {
      estudianteUid,
      nombre: estudianteNombre,
      valores: {},
      definitivo: null,
      matriculadoEn: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Desmatricula a un estudiante de un curso en Firestore.
 */
export async function desmatricularEstudianteDeCursoDb(
  cursoId: string,
  estudianteUid: string
): Promise<void> {
  const db = obtenerAdminDb();
  const notaDocRef = db.collection('cursos').doc(cursoId).collection('notas').doc(estudianteUid);
  await notaDocRef.delete();
}

/**
 * Retorna los estudiantes matriculados en el curso y la lista de estudiantes disponibles para matricular.
 */
export async function obtenerDetalleMatriculasCursoDb(cursoId: string) {
  const curso = await obtenerCursoPorId(cursoId);
  const db = obtenerAdminDb();

  // 1. Obtener notas/estudiantes matriculados
  const notasSnapshot = await db
    .collection('cursos')
    .doc(cursoId)
    .collection('notas')
    .get();

  // 2. Obtener usuarios con rol 'estudiante' para resolver nombres completos
  const usuariosSnapshot = await db
    .collection('usuarios')
    .where('rol', '==', 'estudiante')
    .get();

  const mapaUsuarios = new Map<string, { nombre: string; correo: string }>();
  usuariosSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    mapaUsuarios.set(doc.id, {
      nombre: data.nombre || data.correo || 'Estudiante',
      correo: data.correo || '',
    });
  });

  const matriculados = notasSnapshot.docs.map((doc) => {
    const data = doc.data();
    const infoUsuario = mapaUsuarios.get(doc.id);
    return {
      uid: doc.id,
      nombre: data.nombre || infoUsuario?.nombre || `Estudiante (${doc.id.substring(0, 6)})`,
      matriculadoEn: data.matriculadoEn || data.actualizadoEn || '',
    };
  });

  const uidsMatriculados = new Set(matriculados.map((m) => m.uid));

  const disponibles: { uid: string; nombre: string; correo: string }[] = [];
  usuariosSnapshot.docs.forEach((doc) => {
    if (!uidsMatriculados.has(doc.id)) {
      const data = doc.data();
      disponibles.push({
        uid: doc.id,
        nombre: data.nombre || data.correo || 'Estudiante',
        correo: data.correo || '',
      });
    }
  });

  return {
    curso,
    matriculados,
    disponibles,
  };
}
