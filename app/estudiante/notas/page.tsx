import React from 'react';

export const metadata = {
  title: 'Mis notas | 50 Portal de Calificaciones',
};

interface NotaDetalle {
  actividad: string;
  porcentaje: number;
  valor: number | null;
}

interface CursoEstudiante {
  id: string;
  nombre: string;
  docente: string;
  periodo: string;
  notas: NotaDetalle[];
  definitivo: number | null;
}

const NOTAS_ESTUDIANTE_DEMO: CursoEstudiante[] = [
  {
    id: 'curso-1',
    nombre: 'Arquitectura de Software y Seguridad',
    docente: 'Ing. Alejandro Gómez',
    periodo: '2026-2',
    notas: [
      { actividad: 'Taller 1: Threat Modeling', porcentaje: 30, valor: 4.5 },
      { actividad: 'Parcial 1: Criptografía y Auth', porcentaje: 30, valor: 4.0 },
      { actividad: 'Proyecto Final: Hardening', porcentaje: 40, valor: 4.8 },
    ],
    definitivo: 4.5,
  },
  {
    id: 'curso-2',
    nombre: 'Bases de Datos Distribuidas',
    docente: 'Dra. María Fernández',
    periodo: '2026-2',
    notas: [
      { actividad: 'Laboratorio Firestore', porcentaje: 40, valor: 3.8 },
      { actividad: 'Examen de Consistencia', porcentaje: 60, valor: null },
    ],
    definitivo: null,
  },
];

export default function PaginaMisNotasEstudiante() {
  return (
    <section aria-labelledby="titulo-mis-notas">
      <header style={{ marginBottom: '2rem' }}>
        <h1
          id="titulo-mis-notas"
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.5rem',
          }}
        >
          Mis notas por curso
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          Consulte el detalle de calificaciones y definitivos ponderados de sus cursos matriculados.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {NOTAS_ESTUDIANTE_DEMO.map((curso) => (
          <article
            key={curso.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#1e293b' }}>
                  {curso.nombre}
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  Docente: {curso.docente} · Periodo: {curso.periodo}
                </p>
              </div>

              <div
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: curso.definitivo !== null ? '#ecfdf5' : '#fef3c7',
                  border: `1px solid ${curso.definitivo !== null ? '#a7f3d0' : '#fde68a'}`,
                  textAlign: 'right',
                }}
              >
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                  Definitivo
                </span>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: curso.definitivo !== null ? '#047857' : '#b45309',
                  }}
                >
                  {curso.definitivo !== null ? curso.definitivo.toFixed(1) : 'En progreso'}
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                }}
              >
                <caption style={{ textAlign: 'left', padding: '0.75rem 1.5rem', fontWeight: 600, color: '#475569' }}>
                  Detalle de actividades evaluativas
                </caption>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th scope="col" style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#334155' }}>
                      Actividad
                    </th>
                    <th scope="col" style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                      Porcentaje
                    </th>
                    <th scope="col" style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#334155', textAlign: 'center' }}>
                      Calificación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {curso.notas.map((n, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '0.75rem 1.5rem', color: '#1e293b', fontWeight: 500 }}>
                        {n.actividad}
                      </td>
                      <td style={{ padding: '0.75rem 1.5rem', color: '#64748b', textAlign: 'center' }}>
                        {n.porcentaje}%
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 1.5rem',
                          textAlign: 'center',
                          fontWeight: 700,
                          color: n.valor !== null ? '#0f172a' : '#94a3b8',
                        }}
                      >
                        {n.valor !== null ? n.valor.toFixed(1) : 'Pendiente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

