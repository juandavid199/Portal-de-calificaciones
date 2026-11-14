import React from 'react';

interface PlanillaVaciaProps {
  mensaje?: string;
}

/**
 * Componente informativo para el estado vacío (sin estudiantes o actividades).
 */
export function PlanillaVacia({
  mensaje = 'No hay estudiantes matriculados ni calificaciones registradas en este curso.',
}: PlanillaVaciaProps) {
  return (
    <div
      role="status"
      style={{
        padding: '2.5rem 1.5rem',
        border: '2px dashed #cbd5e1',
        borderRadius: '0.5rem',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        color: '#475569',
        maxWidth: '48rem',
        margin: '2rem auto',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
        Planilla vacía
      </h2>
      <p style={{ color: '#64748b' }}>{mensaje}</p>
    </div>
  );
}

