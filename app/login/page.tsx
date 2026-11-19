'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function obtenerDestinoSeguro(rawRedirect: string | null): string {
  if (!rawRedirect) return '/';
  if (rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')) {
    return rawRedirect;
  }
  return '/';
}

function FormularioLoginContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = obtenerDestinoSeguro(searchParams?.get('redirect') ?? null);

  const { iniciarSesion } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const redirigiendoRef = useRef(false);

  const navegarAlDestino = React.useCallback(() => {
    if (redirigiendoRef.current) return;
    redirigiendoRef.current = true;

    if (typeof router?.replace === 'function') {
      router.replace(redirectTarget);
      router.refresh();
    } else if (typeof window !== 'undefined') {
      window.location.href = redirectTarget;
    }
  }, [redirectTarget, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!correo.trim()) {
      setErrorLocal('El correo electrónico es obligatorio.');
      return;
    }

    if (!contrasena) {
      setErrorLocal('La contraseña es obligatoria.');
      return;
    }

    setEnviando(true);
    try {
      await iniciarSesion(correo.trim(), contrasena);
      navegarAlDestino();
    } catch (err: unknown) {
      setEnviando(false);
      redirigiendoRef.current = false;
      let msg = err instanceof Error ? err.message : 'Error al autenticar';

      if (
        msg.includes('auth/invalid-credential') ||
        msg.includes('auth/wrong-password') ||
        msg.includes('auth/user-not-found')
      ) {
        msg = 'Correo institucional o contraseña incorrectos. Por favor verifique sus datos.';
      } else if (msg.includes('auth/too-many-requests')) {
        msg =
          'Demasiados intentos fallidos. Por seguridad, espere unos minutos antes de intentar de nuevo.';
      } else if (msg.includes('auth/network-request-failed')) {
        msg = 'Error de conexión con Firebase Authentication. Verifique su red e intente de nuevo.';
      } else if (msg.includes('auth/api-key-not-valid')) {
        msg =
          'La configuración de Firebase del cliente (API Key) no es válida. Revise las variables de entorno.';
      }

      setErrorLocal(msg);
    }
  };

  return (
    <section
      aria-labelledby="titulo-login"
      style={{
        maxWidth: '28rem',
        margin: '3rem auto',
        padding: '2rem',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1
          id="titulo-login"
          style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}
        >
          Iniciar sesión
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Ingrese sus credenciales para acceder al portal de calificaciones.
        </p>
      </header>

      {errorLocal && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {errorLocal}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <fieldset
          disabled={enviando}
          style={{
            border: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <legend className="sr-only" style={{ display: 'none' }}>
            Credenciales de acceso
          </legend>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label
              htmlFor="campo-correo"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}
            >
              Correo electrónico institucional
            </label>
            <input
              id="campo-correo"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="docente@portal.edu.co"
              style={{
                padding: '0.625rem 0.875rem',
                fontSize: '1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                minHeight: '2.75rem',
                boxSizing: 'border-box',
                backgroundColor: enviando ? '#f8fafc' : '#ffffff',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label
              htmlFor="campo-contrasena"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}
            >
              Contraseña
            </label>
            <input
              id="campo-contrasena"
              type="password"
              autoComplete="current-password"
              required
              aria-required="true"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              style={{
                padding: '0.625rem 0.875rem',
                fontSize: '1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                minHeight: '2.75rem',
                boxSizing: 'border-box',
                backgroundColor: enviando ? '#f8fafc' : '#ffffff',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: enviando ? '#64748b' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: enviando ? 'not-allowed' : 'pointer',
              minHeight: '2.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.15s ease',
            }}
          >
            {enviando ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                  aria-hidden="true"
                />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Ingresar al portal'
            )}
          </button>
        </fieldset>
      </form>
    </section>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Cargando...</div>}>
      <FormularioLoginContenido />
    </Suspense>
  );
}
