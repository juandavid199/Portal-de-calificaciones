'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BotonVolver } from '@/components/common/BotonVolver';

interface CursoItem {
  id: string;
  nombre: string;
  docenteUid?: string;
  docenteNombre?: string;
  periodo: string;
  cerrado: boolean;
}

interface UsuarioDocente {
  uid: string;
  nombre: string;
  correo: string;
  rol: string;
}

export default function PaginaAdminCursos() {
  const [cursos, setCursos] = useState<CursoItem[]>([]);
  const [docentes, setDocentes] = useState<UsuarioDocente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [docenteSeleccionadoUid, setDocenteSeleccionadoUid] = useState('');
  const [nuevoDocenteNombre, setNuevoDocenteNombre] = useState('');
  const [nuevoPeriodo, setNuevoPeriodo] = useState('2026-2');
  const [notificacion, setNotificacion] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resCursos, resUsuarios] = await Promise.all([
        fetch('/api/cursos'),
        fetch('/api/admin/usuarios').catch(() => null),
      ]);

      if (resCursos.ok) {
        const dataCursos = await resCursos.json();
        setCursos(dataCursos.cursos || []);
      }

      if (resUsuarios && resUsuarios.ok) {
        const dataUsuarios = await resUsuarios.json();
        const soloDocentes = (dataUsuarios.usuarios || []).filter(
          (u: UsuarioDocente) => u.rol === 'docente'
        );
        setDocentes(soloDocentes);
      }
    } catch {
      setNotificacion({ tipo: 'error', texto: 'Error al conectar con la base de datos Firestore.' });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotificacion(null);

    if (!nuevoNombre.trim()) {
      setNotificacion({ tipo: 'error', texto: 'El nombre del curso es obligatorio.' });
      return;
    }

    const docenteObj = docentes.find((d) => d.uid === docenteSeleccionadoUid);
    const docenteNombreFinal = docenteObj ? docenteObj.nombre : (nuevoDocenteNombre.trim() || 'Docente titular');
    const docenteUidFinal = docenteSeleccionadoUid || 'docente-1';

    setGuardando(true);
    try {
      const res = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          docenteUid: docenteUidFinal,
          docenteNombre: docenteNombreFinal,
          periodo: nuevoPeriodo.trim() || '2026-2',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Error ${res.status} al crear el curso en Firestore`);
      }

      setNuevoNombre('');
      setNuevoDocenteNombre('');
      setDocenteSeleccionadoUid('');
      setNotificacion({ tipo: 'exito', texto: `¡Curso creado exitosamente en Firestore!` });
      await cargarDatos();
    } catch (err: unknown) {
      setNotificacion({
        tipo: 'error',
        texto: err instanceof Error ? err.message : 'Error al crear curso',
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section aria-labelledby="titulo-admin-cursos">
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
                Inicio
              </Link>
              <span aria-hidden="true" style={{ margin: '0 0.5rem' }}>/</span>
            </li>
            <li aria-current="page" style={{ fontWeight: 600, color: '#0f172a' }}>
              Administración de cursos
            </li>
          </ol>
        </nav>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            href="/admin/usuarios"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              minHeight: '2.75rem',
            }}
          >
            👥 Gestión de usuarios →
          </Link>
          <BotonVolver href="/" texto="Volver al inicio" />
        </div>
      </div>
      <header style={{ marginBottom: '2rem' }}>
        <h1
          id="titulo-admin-cursos"
          style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}
        >
          Gestión de cursos y asignaturas (Firestore)
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          Panel de administración académica: creación de cursos en la colección `cursos` de Firestore y asignación de docentes.
        </p>
      </header>

      {/* Región de estado accesible */}
      {notificacion && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '1rem',
            backgroundColor: notificacion.tipo === 'exito' ? '#ecfdf5' : '#fee2e2',
            color: notificacion.tipo === 'exito' ? '#065f46' : '#991b1b',
            border: `1px solid ${notificacion.tipo === 'exito' ? '#a7f3d0' : '#fca5a5'}`,
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          {notificacion.texto}
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
              <label htmlFor="docente-curso-select" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                Docente responsable
              </label>
              {docentes.length > 0 ? (
                <select
                  id="docente-curso-select"
                  value={docenteSeleccionadoUid}
                  onChange={(e) => setDocenteSeleccionadoUid(e.target.value)}
                  style={{
                    padding: '0.625rem 0.75rem',
                    border: '1px solid #94a3b8',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    minHeight: '2.75rem',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">-- Seleccionar docente registrado --</option>
                  {docentes.map((d) => (
                    <option key={d.uid} value={d.uid}>
                      {d.nombre} ({d.correo})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="docente-curso-text"
                  type="text"
                  value={nuevoDocenteNombre}
                  onChange={(e) => setNuevoDocenteNombre(e.target.value)}
                  placeholder="Ej. Prof. Carlos Mendoza"
                  style={{
                    padding: '0.625rem 0.75rem',
                    border: '1px solid #94a3b8',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    minHeight: '2.75rem',
                    boxSizing: 'border-box',
                  }}
                />
              )}
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
              disabled={guardando}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: guardando ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: guardando ? 'not-allowed' : 'pointer',
                minHeight: '2.75rem',
              }}
            >
              {guardando ? 'Guardando en Firestore...' : '+ Crear curso en Firestore'}
            </button>
          </div>
        </fieldset>
      </form>

      {/* Tabla de cursos */}
      <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', textAlign: 'left' }}>
          <caption style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>
            Listado de cursos registrados en Firestore ({cursos.length})
          </caption>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                ID en Firestore
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                Curso
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                Docente
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                Periodo
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  Cargando cursos desde Firestore...
                </td>
              </tr>
            ) : cursos.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No hay cursos registrados en Firestore aún. Cree uno arriba.
                </td>
              </tr>
            ) : (
              cursos.map((c, i) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                    <code>{c.id}</code>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                    {c.nombre}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                    {c.docenteNombre || c.docenteUid || 'Docente titular'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#0284c7' }}>
                    {c.periodo}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
