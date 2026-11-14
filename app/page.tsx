import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Mis cursos | 50 Portal de Calificaciones',
};

interface CursoItem {
  id: string;
  nombre: string;
  periodo: string;
  rol: 'docente' | 'estudiante';
  cerrado: boolean;
}

const CURSOS_DEMO: CursoItem[] = [
  {
    id: 'demo-1',
    nombre: 'Desarrollo Web Full Stack',
    periodo: '2026-2',
    rol: 'docente',
    cerrado: false,
  },
  {
    id: 'demo-2',
    nombre: 'Arquitectura de Software y Seguridad',
    periodo: '2026-2',
    rol: 'estudiante',
    cerrado: false,
  },
];

export default function PaginaMisCursos() {
  return (
    <section aria-labelledby="titulo-mis-cursos">
      <header style={{ marginBottom: '2rem' }}>
        <h1
          id="titulo-mis-cursos"
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.5rem',
          }}
        >
          Mis cursos
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          Seleccione un curso para registrar calificaciones, definir actividades o consultar sus notas definitivas.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
          gap: '1.5rem',
        }}
      >
        {CURSOS_DEMO.map((curso) => (
          <article
            key={curso.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '0.25rem',
                  backgroundColor: curso.rol === 'docente' ? '#dbeafe' : '#dcfce7',
                  color: curso.rol === 'docente' ? '#1e40af' : '#166534',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                {curso.rol}
              </span>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: '0 0 0.5rem 0',
                }}
              >
                {curso.nombre}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.25rem 0' }}>
                Periodo académico: {curso.periodo} {curso.cerrado && '· (Cerrado)'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {curso.rol === 'docente' ? (
                <>
                  <Link
                    href={`/docente/cursos/${curso.id}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '0.625rem 1rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      minHeight: '2.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Ver planilla
                  </Link>
                  <Link
                    href={`/docente/cursos/${curso.id}/actividades`}
                    style={{
                      padding: '0.625rem 1rem',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      minHeight: '2.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Actividades
                  </Link>
                </>
              ) : (
                <Link
                  href="/estudiante/notas"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.625rem 1rem',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    minHeight: '2.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Consultar mis notas
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
