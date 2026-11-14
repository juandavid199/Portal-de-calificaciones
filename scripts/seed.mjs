import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// 1. Inicializar Firebase Admin usando las variables de entorno inyectadas
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Error: Faltan variables de Firebase en .env.local (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
  process.exit(1);
}

// Convertir \n literales a saltos de línea reales
privateKey = privateKey.replace(/\\n/g, '\n');

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

// 2. Definición de usuarios a inicializar con sus respectivos roles
const USUARIOS_SEED = [
  {
    email: 'docente@portal.edu.co',
    password: 'Docente123!',
    displayName: 'Prof. Carlos Mendoza',
    rol: 'docente',
  },
  {
    email: 'estudiante@portal.edu.co',
    password: 'Estudiante123!',
    displayName: 'Camila Morales',
    rol: 'estudiante',
  },
  {
    email: 'admin@portal.edu.co',
    password: 'Admin123!',
    displayName: 'Administrador General',
    rol: 'admin',
  },
];

async function registrarOActualizarUsuario(datos) {
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(datos.email);
    console.log(`ℹ️ Usuario existente: ${datos.email} (UID: ${userRecord.uid})`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      userRecord = await auth.createUser({
        email: datos.email,
        password: datos.password,
        displayName: datos.displayName,
      });
      console.log(`✅ Usuario creado: ${datos.email} (Password: ${datos.password})`);
    } else {
      throw err;
    }
  }

  // Asignar el Custom Claim de Rol mediante el Admin SDK
  await auth.setCustomUserClaims(userRecord.uid, { rol: datos.rol });
  console.log(`   🏷️ Rol asignado: "${datos.rol}" a ${datos.email}`);
  return userRecord;
}

async function inicializarCursos(docenteUid, estudianteUid) {
  console.log('\n📚 Inicializando cursos y planilla en Firestore...');

  const cursoRef = db.collection('cursos').doc('demo-1');
  const cursoDoc = {
    nombre: 'Desarrollo Web Full Stack - Portal de Calificaciones',
    periodo: '2026-2',
    docenteUid: docenteUid,
    cerrado: false,
    actividades: [
      { id: 'act-1', nombre: 'Taller 1: Accesibilidad y HTML Semántico', porcentaje: 30 },
      { id: 'act-2', nombre: 'Parcial 1: APIs y Seguridad', porcentaje: 30 },
      { id: 'act-3', nombre: 'Proyecto Final: Portal con Firestore', porcentaje: 40 },
    ],
    creadoEn: new Date().toISOString(),
  };

  await cursoRef.set(cursoDoc, { merge: true });
  console.log('   ✅ Curso "demo-1" configurado en Firestore');

  // Registrar planilla de notas
  const notasRef = cursoRef.collection('notas');

  await notasRef.doc(estudianteUid).set({
    estudianteUid,
    nombre: 'Camila Morales',
    valores: { 'act-1': 4.5, 'act-2': 4.0, 'act-3': 4.8 },
    definitivo: 4.5,
    actualizadoEn: new Date().toISOString(),
  });

  await notasRef.doc('est-002').set({
    estudianteUid: 'est-002',
    nombre: 'Mateo Gómez',
    valores: { 'act-1': 3.2, 'act-2': 2.8, 'act-3': 3.5 },
    definitivo: 3.2,
    actualizadoEn: new Date().toISOString(),
  });

  console.log('   ✅ Planilla de calificaciones poblada en Firestore');
}

async function main() {
  console.log('🚀 Iniciando script de aprovisionamiento de Firebase (Seed)...');

  let docenteUid = '';
  let estudianteUid = '';

  for (const u of USUARIOS_SEED) {
    const record = await registrarOActualizarUsuario(u);
    if (u.rol === 'docente') docenteUid = record.uid;
    if (u.rol === 'estudiante') estudianteUid = record.uid;
  }

  // Comprobar si existe el usuario personal djuandavid757 y asignarle rol docente/admin
  try {
    const misUsuarios = await auth.listUsers(10);
    for (const u of misUsuarios.users) {
      if (u.email && u.email.includes('djuandavid757')) {
        await auth.setCustomUserClaims(u.uid, { rol: 'docente' });
        console.log(`\n👑 Rol asignado a tu cuenta personal (${u.email}): "docente"`);
        docenteUid = u.uid;
      }
    }
  } catch (e) {
    // Silencioso si no hay permisos de listUsers
  }

  await inicializarCursos(docenteUid, estudianteUid);

  console.log('\n🎉 ¡Proceso finalizado con éxito!');
  console.log('\nCredenciales de prueba generadas:');
  console.log('--------------------------------------------------');
  console.log('👨‍🏫 Docente:    docente@portal.edu.co    / Docente123!');
  console.log('👨‍🎓 Estudiante: estudiante@portal.edu.co / Estudiante123!');
  console.log('🛡️ Admin:      admin@portal.edu.co      / Admin123!');
  console.log('--------------------------------------------------\n');
}

main().catch((err) => {
  console.error('❌ Error ejecutando seed:', err);
  process.exit(1);
});

