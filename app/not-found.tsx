import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Página no encontrada (404) | 50 Portal de Calificaciones',
};

/**
 * Página 404 personalizada y accesible.
 */
export default function NotFound() {
  return (
    <div
      role="region"
      aria-labelledby="titulo-404"
      style={{
        maxWidth: '36rem',
        margin: '4rem auto',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '0.5rem',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          fontSize: '3rem',
          fontWeight: 900,
          color: '#2563eb',
          marginBottom: '1rem',
        }}
      >
        404
      </span>
      <h1
        id="titulo-404"
        style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}
      >
        Página no encontrada
      </h1>
      <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
        La ruta solicitada no existe o no tiene los permisos suficientes para acceder a ella.
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.625rem 1.5rem',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '0.375rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: '2.75rem',
        }}
      >
        Regresar a Mis Cursos
      </Link>
    </div>
  );
}

