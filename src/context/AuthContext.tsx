'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { obtenerAuthCliente } from '@/lib/firebaseClient';
import type { RolUsuario } from '@/lib/auth';

interface UsuarioSesion {
  uid: string;
  correo?: string;
  rol: RolUsuario;
}

interface AuthContextType {
  usuario: UsuarioSesion | null;
  rol: RolUsuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  rol: null,
  cargando: true,
  iniciarSesion: async () => {},
  cerrarSesion: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  // Sincronizar usuario activo consultando /api/auth/yo
  const refrescarPerfilServidor = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/yo', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUsuario(data.usuario);
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    try {
      const auth = obtenerAuthCliente();
      const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
          await refrescarPerfilServidor();
        } else {
          setUsuario(null);
          setCargando(false);
        }
      });
      return () => unsubscribe();
    } catch {
      setCargando(false);
    }
  }, [refrescarPerfilServidor]);

  const iniciarSesion = async (correo: string, contrasena: string) => {
    setCargando(true);
    try {
      const auth = obtenerAuthCliente();
      const cred = await signInWithEmailAndPassword(auth, correo, contrasena);
      const idToken = await cred.user.getIdToken();

      // Enviar idToken al servidor para establecer la cookie HttpOnly
      const res = await fetch('/api/auth/sesion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'No se pudo establecer la sesión en el servidor.');
      }

      await refrescarPerfilServidor();
    } catch (err: unknown) {
      setCargando(false);
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      throw new Error(msg);
    }
  };

  const cerrarSesion = async () => {
    setCargando(true);
    try {
      const auth = obtenerAuthCliente();
      await signOut(auth);

      await fetch('/api/auth/sesion', {
        method: 'DELETE',
        credentials: 'include',
      });

      setUsuario(null);
      if (typeof router?.replace === 'function') {
        router.replace('/login');
      }
    } catch {
      setUsuario(null);
      if (typeof router?.replace === 'function') {
        router.replace('/login');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol: usuario?.rol || null,
        cargando,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

