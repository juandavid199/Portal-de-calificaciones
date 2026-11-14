'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Límite de error global accesible (WCAG 2.2 AA).
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Loggear sin exponer datos sensibles
    console.error('Error global capturado:', error.message);
  }, [error]);

  return (
    <div
      role="alert"
      style={{
        maxWidth: '40rem',
        margin: '3rem auto',
        padding: '2rem',
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '0.5rem',
        textAlign: 'center',
        color: '#991b1b',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        Se produjo un error al cargar la vista
      </h1>
      <p style={{ color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        No se pudo completar la solicitud. Puedes intentar recargar el componente.
      </p>

      <button
        type="button"
        onClick={() => reset()}
        style={{
          padding: '0.625rem 1.25rem',
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          minHeight: '2.75rem',
        }}
      >
        Reintentar operación
      </button>
    </div>
  );
}

