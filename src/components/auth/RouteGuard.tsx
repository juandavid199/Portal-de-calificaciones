'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * RouteGuard (Cliente):
 * - Garantiza que ninguna vista interna pueda renderizarse sin sesión iniciada.
 * - Si no hay usuario y no es una ruta pública (/login), bloquea el contenido y redirige a /login.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  const pathname = usePathname() || '/';
  const router = useRouter();

  const esRutaPublica = pathname === '/login' || pathname.startsWith('/api');

  useEffect(() => {
    if (!cargando && !usuario && !esRutaPublica) {
      if (typeof router?.replace === 'function') {
        router.replace('/login');
      }
    }
  }, [cargando, usuario, esRutaPublica, router]);

  // Durante la carga inicial de sesión, evitar flasheo de contenido protegido
  if (cargando && !esRutaPublica) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
          gap: '1rem',
          color: '#64748b',
        }}
      >
        <p style={{ fontWeight: 600, fontSize: '1rem' }}>Comprobando credenciales de acceso...</p>
      </div>
    );
  }

  // Si no está autenticado y no es ruta pública, bloquear completamente la renderización
  if (!usuario && !esRutaPublica) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#b91c1c',
          fontWeight: 600,
        }}
      >
        Debe iniciar sesión para acceder al portal de calificaciones. Redirigiendo a /login...
      </div>
    );
  }

  return <>{children}</>;
}
