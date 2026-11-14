import React from 'react';

interface PlanillaErrorProps {
  mensaje?: string;
  onReintentar?: () => void;
}

/**
 * Componente accesible para el estado de error de la planilla de notas.
 * Usa role="alert" y botón semántico de acción para reintentar.
 */
export function PlanillaError({
  mensaje = 'Ocurrió un error al cargar la planilla de notas.',
  onReintentar,
}: PlanillaErrorProps) {
  return (
    <div
      role="alert"
      style={{
        padding: '1.5rem',
        border: '1px solid #fca5a5',
        borderRadius: '0.5rem',
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        maxWidth: '48rem',
        margin: '1.5rem auto',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        No se pudo cargar la planilla
      </h2>
      <p style={{ marginBottom: '1rem', color: '#b91c1c' }}>{mensaje}</p>

      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Reintentar carga
        </button>
      )}
    </div>
  );
}

