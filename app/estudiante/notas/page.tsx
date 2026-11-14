'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BotonVolver } from '@/components/common/BotonVolver';

interface NotaCursoItem {
  cursoId: string;
  cursoNombre: string;
  periodo: string;
  cerrado: boolean;
  actividades: { id: string; nombre: string; porcentaje: number }[];
  valores: Record<string, number | null>;
  definitivo: number | null;
}

export default function PaginaMisNotasEstudiante() {
  const [cursos, setCursos] = useState<NotaCursoItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const cargarNotas = useCallback(async () => {
    setCargando(true);
    setErrorMensaje(null);
    try {
      const res = await fetch('/api/estudiante/notas');
      if (!res.ok) {
        throw new Error('No se pudieron obtener las calificaciones desde Firestore.');
      }
      const data = await res.json();
      setCursos(data.items || []);
    } catch (err: unknown) {
      setErrorMensaje(err instanceof Error ? err.message : 'Error inesperado al cargar notas');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  return (
    <section aria-labelledby="titulo-mis-notas">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <nav aria-label="Ruta de navegación (Miga de pan)">
          <ol
            style={{
              display: 'flex',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b',
            }}
          >
            <li>
              <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
                Mis cursos
              </Link>
              <span aria-hidden="true" style={{ margin: '0 0.5rem' }}>/</span>
            </li>
            <li aria-current="page" style={{ fontWeight: 600, color: '#0f172a' }}>
              Mis notas
            </li>
          </ol>
        </nav>
        <BotonVolver href="/" texto="Volver a mis cursos" />
      </div>
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
          Mis calificaciones académicas
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          Consulte sus notas en tiempo real y definitivos ponderados registrados en Firestore.
        </p>
      </header>

      {cargando && (
        <div role="status" aria-live="polite" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Consultando calificaciones en Firestore...
        </div>
      )}

      {errorMensaje && (
        <div
          role="alert"
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{errorMensaje}</span>
          <button
            type="button"
            onClick={cargarNotas}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !errorMensaje && cursos.length === 0 && (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            border: '1px solid #cbd5e1',
          }}
        >
          <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#334155', margin: '0 0 0.5rem 0' }}>
            Aún no tienes asignaturas matriculadas o notas registradas.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Una vez el docente registre sus calificaciones en la planilla de Firestore, aparecerán aquí automáticamente.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {cursos.map((curso) => (
          <article
            key={curso.cursoId}
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
                  {curso.cursoNombre}
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  Periodo: {curso.periodo} {curso.cerrado && ' · (Curso Cerrado)'}
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
                  {curso.actividades.map((act) => {
                    const valor = curso.valores[act.id] ?? null;
                    return (
                      <tr
                        key={act.id}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <td style={{ padding: '0.75rem 1.5rem', color: '#1e293b', fontWeight: 500 }}>
                          {act.nombre}
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem', color: '#64748b', textAlign: 'center' }}>
                          {act.porcentaje}%
                        </td>
                        <td
                          style={{
                            padding: '0.75rem 1.5rem',
                            textAlign: 'center',
                            fontWeight: 700,
                            color: valor !== null ? (valor < 3.0 ? '#dc2626' : '#0f172a') : '#94a3b8',
                          }}
                        >
                          {valor !== null ? valor.toFixed(1) : 'Pendiente'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
