'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

function esRolValido(val: unknown): val is RolUsuario {
  return val === 'admin' || val === 'docente' || val === 'estudiante';
}

async function fetchConTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const autenticandoRef = useRef(false);

  // Establecer cookie en el servidor a partir de un idToken
  const establecerCookieServidor = useCallback(async (idToken: string): Promise<UsuarioSesion> => {
    const res = await fetchConTimeout(
      '/api/auth/sesion',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      },
      10000
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(
        errJson?.error || `No se pudo establecer la sesión en el servidor (HTTP ${res.status}).`
      );
    }

    const data = await res.json();
    return data.usuario as UsuarioSesion;
  }, []);

  // Sincronizar usuario activo consultando /api/auth/yo
  const refrescarPerfilServidor = useCallback(
    async (userCliente?: User | null) => {
      try {
        const res = await fetchConTimeout(
          '/api/auth/yo',
          {
            method: 'GET',
            credentials: 'include',
          },
          6000
        );

        if (res.ok) {
          const data = await res.json();
          setUsuario(data.usuario);
          return;
        }

        // Si el cliente tiene sesión en Firebase Auth pero la cookie HttpOnly expiró, renovarla automáticamente
        if (res.status === 401 && userCliente) {
          try {
            const idTokenFresco = await userCliente.getIdToken(true);
            const usuarioRenovado = await establecerCookieServidor(idTokenFresco);
            setUsuario(usuarioRenovado);
            return;
          } catch {
            const auth = obtenerAuthCliente();
            await signOut(auth).catch(() => null);
            setUsuario(null);
            return;
          }
        }

        setUsuario(null);
      } catch {
        // Si falla la red pero ya teníamos perfil en cliente, no destruir sesión localmente si no es 401
      } finally {
        setCargando(false);
      }
    },
    [establecerCookieServidor]
  );

  useEffect(() => {
    try {
      const auth = obtenerAuthCliente();
      const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
        // Si el usuario está ejecutando iniciarSesion(), evitar llamada redundante
        if (autenticandoRef.current) {
          return;
        }

        if (user) {
          try {
            // Leer claims cacheados en IndexedDB (~5ms) para renderizar la interfaz al instante
            const tokenResult = await user.getIdTokenResult();
            if (esRolValido(tokenResult.claims.rol)) {
              setUsuario({
                uid: user.uid,
                correo: user.email || undefined,
                rol: tokenResult.claims.rol,
              });
              setCargando(false);
            }
          } catch {
            // Continuar a verificación de servidor
          }

          await refrescarPerfilServidor(user);
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
    autenticandoRef.current = true;
    try {
      const auth = obtenerAuthCliente();
      const cred = await signInWithEmailAndPassword(auth, correo, contrasena);
      const idToken = await cred.user.getIdToken();

      const usuarioServidor = await establecerCookieServidor(idToken);
      if (usuarioServidor) {
        setUsuario(usuarioServidor);
      } else {
        await refrescarPerfilServidor(cred.user);
      }
    } catch (err: unknown) {
      setUsuario(null);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(
          'El servidor tardó demasiado en responder al crear la sesión. Por favor intente nuevamente.'
        );
      }
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      throw new Error(msg);
    } finally {
      autenticandoRef.current = false;
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    setCargando(true);
    try {
      const auth = obtenerAuthCliente();
      await signOut(auth);

      await fetchConTimeout(
        '/api/auth/sesion',
        {
          method: 'DELETE',
          credentials: 'include',
        },
        4000
      ).catch(() => null);

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
