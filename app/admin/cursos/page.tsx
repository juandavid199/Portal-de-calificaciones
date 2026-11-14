'use client';

import React, { useState } from 'react';

interface CursoAdmin {
  id: string;
  nombre: string;
  docente: string;
  matriculados: number;
  periodo: string;
  cerrado: boolean;
}

const CURSOS_INICIALES: CursoAdmin[] = [
  {
    id: 'c-101',
    nombre: 'Desarrollo Web Full Stack',
    docente: 'Prof. Carlos Mendoza',
    matriculados: 24,
    periodo: '2026-2',
    cerrado: false,
  },
  {
    id: 'c-102',
    nombre: 'Arquitectura de Software y Seguridad',
    docente: 'Prof. Luisa Ortega',
    matriculados: 18,
    periodo: '2026-2',
    cerrado: false,
  },
];

export default function PaginaAdminCursos() {
  const [cursos, setCursos] = useState<CursoAdmin[]>(CURSOS_INICIALES);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoDocente, setNuevoDocente] = useState('');
  const [nuevoPeriodo, setNuevoPeriodo] = useState('2026-2');
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const handleCrearCurso = (e: React.FormEvent) => {
    e.preventDefault();
    setNotificacion(null);

    if (!nuevoNombre.trim() || !nuevoDocente.trim()) {
      setNotificacion('Todos los campos son obligatorios.');
      return;
    }

    const nuevo: CursoAdmin = {
      id: `c-${Date.now()}`,
      nombre: nuevoNombre.trim(),
      docente: nuevoDocente.trim(),
      matriculados: 0,
      periodo: nuevoPeriodo,
      cerrado: false,
    };

    setCursos((prev) => [nuevo, ...prev]);
    setNuevoNombre('');
    setNuevoDocente('');
    setNotificacion(`Curso "${nuevo.nombre}" creado exitosamente.`);
  };

  return (
    <section aria-labelledby="titulo-admin-cursos">
      <header style={{ marginBottom: '2rem' }}>
        <h1
          id="titulo-admin-cursos"
          style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}
        >
          Gestión de cursos y matrículas
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          Panel de administración académica: creación de cursos, asignación de docentes y supervisión de matrículas.
        </p>
      </header>

      {/* Región de estado accesible */}
      {notificacion && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '1rem',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          {notificacion}
        </div>
      )}

      {/* Formulario de creación de curso */}
      <form
        onSubmit={handleCrearCurso}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            Registrar nuevo curso académico
          </legend>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="nombre-curso" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                Nombre de la asignatura
              </label>
              <input
                id="nombre-curso"
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej. Seguridad Informática"
                style={{
                  padding: '0.625rem 0.75rem',
                  border: '1px solid #94a3b8',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  minHeight: '2.75rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="docente-curso" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                Docente responsable
              </label>
              <input
                id="docente-curso"
                type="text"
                value={nuevoDocente}
                onChange={(e) => setNuevoDocente(e.target.value)}
                placeholder="Ej. Ing. Diana Restrepo"
                style={{
                  padding: '0.625rem 0.75rem',
                  border: '1px solid #94a3b8',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  minHeight: '2.75rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="periodo-curso" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                Periodo académico
              </label>
              <input
                id="periodo-curso"
                type="text"
                value={nuevoPeriodo}
                onChange={(e) => setNuevoPeriodo(e.target.value)}
                style={{
                  padding: '0.625rem 0.75rem',
                  border: '1px solid #94a3b8',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  minHeight: '2.75rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '2.75rem',
              }}
            >
              + Crear curso
            </button>
          </div>
        </fieldset>
      </form>

      {/* Tabla de cursos */}
      <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', textAlign: 'left' }}>
          <caption style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>
            Listado de cursos registrados
          </caption>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                Código
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                Curso
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                Docente
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                Estudiantes Matriculados
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((c, i) => (
              <tr
                key={c.id}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                }}
              >
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                  {c.id}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                  {c.nombre}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                  {c.docente}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#0284c7' }}>
                  {c.matriculados}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: c.cerrado ? '#fee2e2' : '#dcfce7',
                      color: c.cerrado ? '#991b1b' : '#166534',
                    }}
                  >
                    {c.cerrado ? 'Cerrado' : 'Abierto'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

