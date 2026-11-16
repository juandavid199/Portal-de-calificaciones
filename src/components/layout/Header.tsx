import React from 'react';
import Link from 'next/link';
import { Navigation } from './Navigation';

/**
 * Componente Header con landmark semántico <header> (role="banner").
 * Contiene el título del sitio y el contenedor de navegación accesible.
 */
export function Header() {
  return (
    <header
      style={{
        backgroundColor: '#1e293b',
        color: '#ffffff',
        borderBottom: '1px solid #334155',
        padding: '0.75rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Link
          href="/"
          prefetch={false}
          style={{
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '1.25rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: '2.75rem',
          }}
        >
          50 · Portal de Calificaciones
        </Link>
        <Navigation />
      </div>
    </header>
  );
}

