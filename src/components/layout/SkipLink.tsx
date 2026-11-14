'use client';

import React from 'react';

/**
 * Enlace accesible "Saltar al contenido principal" (WCAG 2.4.1 Bypass Blocks).
 * Invisible visualmente por defecto, se hace visible al recibir el foco mediante teclado.
 */
export function SkipLink() {
  return (
    <a
      href="#contenido-principal"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 100,
        padding: '0.75rem 1.25rem',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        fontWeight: 600,
        textDecoration: 'none',
        borderRadius: '0 0 0.375rem 0.375rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.position = 'fixed';
        e.currentTarget.style.left = '1rem';
        e.currentTarget.style.top = '1rem';
        e.currentTarget.style.width = 'auto';
        e.currentTarget.style.height = 'auto';
      }}
      onBlur={(e) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.left = '-9999px';
        e.currentTarget.style.top = 'auto';
        e.currentTarget.style.width = '1px';
        e.currentTarget.style.height = '1px';
      }}
    >
      Saltar al contenido principal
    </a>
  );
}

