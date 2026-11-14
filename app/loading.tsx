import React from 'react';

/**
 * Estado global de carga (Next.js App Router).
 * Accesible para tecnologías de asistencia mediante aria-busy="true".
 */
export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        padding: '3rem 1.5rem',
        maxWidth: '48rem',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '3rem',
          height: '3rem',
          margin: '0 auto 1.5rem auto',
          border: '4px solid #cbd5e1',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
        Cargando página...
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
        Por favor espere mientras se obtienen los datos.
      </p>
    </div>
  );
}

