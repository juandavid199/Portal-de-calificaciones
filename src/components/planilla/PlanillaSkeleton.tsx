import React from 'react';

/**
 * Componente esqueleto para el estado de carga de la planilla de notas.
 * Accesible para lectores de pantalla con aria-busy="true".
 */
export function PlanillaSkeleton() {
  return (
    <div
      role="region"
      aria-label="Cargando planilla de notas"
      aria-busy="true"
      style={{
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        backgroundColor: '#f8fafc',
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            height: '1.75rem',
            width: '40%',
            backgroundColor: '#cbd5e1',
            borderRadius: '0.25rem',
            animation: 'pulse 1.5s infinite ease-in-out',
            marginBottom: '0.75rem',
          }}
        />
        <div
          style={{
            height: '1rem',
            width: '60%',
            backgroundColor: '#e2e8f0',
            borderRadius: '0.25rem',
          }}
        />
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            {['Estudiante', 'Actividad 1 (30%)', 'Actividad 2 (30%)', 'Actividad 3 (40%)', 'Definitivo'].map(
              (header, i) => (
                <th
                  key={i}
                  style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    backgroundColor: '#e2e8f0',
                    borderBottom: '2px solid #cbd5e1',
                  }}
                >
                  <div
                    style={{
                      height: '1rem',
                      width: '80%',
                      backgroundColor: '#94a3b8',
                      borderRadius: '0.25rem',
                    }}
                  />
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4].map((row) => (
            <tr key={row}>
              {[1, 2, 3, 4, 5].map((col) => (
                <td
                  key={col}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      height: '1.25rem',
                      width: col === 1 ? '70%' : '50%',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '0.25rem',
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
        Cargando datos de la planilla, por favor espere...
      </p>
    </div>
  );
}

