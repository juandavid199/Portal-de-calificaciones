import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { initializeFirestore, getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore | null = null;

export function obtenerFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // Si no están configuradas en entorno de test/local, permitir inicialización con dummy para no romper tests
    if (process.env.NODE_ENV === 'test') {
      adminApp = initializeApp({ projectId: 'test-project' }, 'test-app');
      return adminApp;
    }
    throw new Error(
      'Faltan variables de entorno requeridas para Firebase Admin SDK (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
    );
  }

  // Convertir \n literales a saltos de línea reales si provienen de variables de entorno (ej. Vercel)
  privateKey = privateKey.replace(/\\n/g, '\n');

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return adminApp;
}

export function obtenerAdminAuth(): Auth {
  return getAuth(obtenerFirebaseAdmin());
}

export function obtenerAdminDb(): Firestore {
  if (adminDb) {
    return adminDb;
  }
  const app = obtenerFirebaseAdmin();
  try {
    adminDb = initializeFirestore(app, { preferRest: true });
  } catch {
    adminDb = getFirestore(app);
  }
  return adminDb;
}

