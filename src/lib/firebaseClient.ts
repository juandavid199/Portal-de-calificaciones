import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'dummy-app-id',
};

// Singleton para evitar reinicializaciones en el cliente
let clienteApp: FirebaseApp;

export function obtenerFirebaseCliente(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  clienteApp = initializeApp(firebaseConfig);
  return clienteApp;
}

export function obtenerAuthCliente(): Auth {
  return getAuth(obtenerFirebaseCliente());
}

