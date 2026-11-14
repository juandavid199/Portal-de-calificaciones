import React from 'react';
import Link from 'next/link';

interface BotonVolverProps {
  href: string;
  texto: string;
  etiquetaAria?: string;
}

/**
 * Componente BotonVolver:
 * - Enlace semántico (<a>) accesible para navegar hacia atrás entre vistas.
 * - Tamaño de objetivo táctil accesible (minHeight 2.75rem / 44px).
 * - Alto contraste (fondo claro #f1f5f9 con texto #1e293b, ratio > 7:1).
 */
export function BotonVolver({ href, texto, etiquetaAria }: BotonVolverProps) {
  return (
    <Link
      href={href}
      aria-label={etiquetaAria || texto}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#f1f5f9',
        color: '#1e293b',
        border: '1px solid #cbd5e1',
        borderRadius: '0.375rem',
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        minHeight: '2.75rem',
        boxSizing: 'border-box',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <span aria-hidden="true">←</span>
      <span>{texto}</span>
    </Link>
  );
}

