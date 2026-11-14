'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/**
 * Componente de navegación accesible y dinámico según autenticación y rol:
 * - Si NO ha iniciado sesión: Solo muestra el botón "Iniciar sesión".
 * - Si YA inició sesión: Muestra las rutas correspondientes a su rol (estudiante, docente, admin).
 */
export function Navigation() {
  const { usuario, rol, cerrarSesion } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto]);

  return (
    <nav aria-label="Navegación principal" style={{ position: 'relative' }}>
      <button
        ref={botonRef}
        type="button"
        aria-expanded={abierto}
        aria-controls="menu-navegacion"
        aria-label={abierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        onClick={() => setAbierto((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '2.75rem',
          minHeight: '2.75rem',
          padding: '0.5rem',
          backgroundColor: '#334155',
          color: '#ffffff',
          border: '1px solid #475569',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        <span aria-hidden="true">{abierto ? '✕' : '☰'}</span>
      </button>

      <div
        id="menu-navegacion"
        ref={menuRef}
        style={{
          display: abierto ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'absolute',
          top: '100%',
          right: 0,
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '1rem',
          minWidth: '16rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          zIndex: 50,
          marginTop: '0.5rem',
          gap: '0.5rem',
        }}
      >
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '0.5rem',
          }}
        >
          {/* Si el usuario ha iniciado sesión, mostrar las rutas del portal */}
          {usuario ? (
            <>
              <li>
                <Link
                  href="/"
                  onClick={() => setAbierto(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '2.75rem',
                    padding: '0.5rem 1rem',
                    color: '#f8fafc',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 500,
                  }}
                >
                  Mis cursos
                </Link>
              </li>

              {/* Rutas para rol Estudiante o Admin */}
              {(!rol || rol === 'estudiante' || rol === 'admin') && (
                <li>
                  <Link
                    href="/estudiante/notas"
                    onClick={() => setAbierto(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '2.75rem',
                      padding: '0.5rem 1rem',
                      color: '#f8fafc',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    Mis notas
                  </Link>
                </li>
              )}

              {/* Rutas para rol Docente o Admin */}
              {(rol === 'docente' || rol === 'admin') && (
                <li>
                  <Link
                    href="/docente/cursos/demo-1"
                    onClick={() => setAbierto(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '2.75rem',
                      padding: '0.5rem 1rem',
                      color: '#f8fafc',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    Gestión docente
                  </Link>
                </li>
              )}

              {/* Rutas exclusivas de Admin */}
              {rol === 'admin' && (
                <li>
                  <Link
                    href="/admin/cursos"
                    onClick={() => setAbierto(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '2.75rem',
                      padding: '0.5rem 1rem',
                      color: '#f8fafc',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    Administración
                  </Link>
                </li>
              )}

              <li style={{ borderTop: '1px solid #334155', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={async () => {
                    setAbierto(false);
                    await cerrarSesion();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '2.75rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#f87171',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cerrar sesión ({usuario.correo || usuario.uid})
                </button>
              </li>
            </>
          ) : (
            /* Si NO ha iniciado sesión, solo mostrar opción de login */
            <li>
              <Link
                href="/login"
                onClick={() => setAbierto(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '2.75rem',
                  padding: '0.5rem 1rem',
                  color: '#38bdf8',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
