import React from 'react';

/**
 * Componente Footer con landmark semántico <footer> (role="contentinfo").
 */
export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        borderTop: '1px solid #1e293b',
        padding: '1.5rem',
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '0.875rem',
      }}
    >
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <p style={{ margin: 0 }}>
          50 Portal de Calificaciones &copy; {new Date().getFullYear()} — Plataforma Académica Accesible y Segura
        </p>
      </div>
    </footer>
  );
}

