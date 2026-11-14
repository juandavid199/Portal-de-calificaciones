'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { RolUsuario } from '@/lib/auth';

interface CursoItem {
  id: string;
  nombre: string;
  periodo: string;
  docenteNombre?: string;
  docenteUid?: string;
  cerrado: boolean;
}

export default function PaginaMisCursos() {
  const { usuario, rol, cargando } = useAuth();
  const [cursos, setCursos] = useState<CursoItem[]>([]);
  const [cargandoCursos, setCargandoCursos] = useState<boolean>(true);

  const rolActivo: RolUsuario = rol || 'estudiante';

  useEffect(() => {
    let cancelado = false;
    async function cargarCursos() {
      if (!usuario) return;
      setCargandoCursos(true);
      try {
        const res = await fetch('/api/cursos');
        if (res.ok) {
          const data = await res.json();
          if (!cancelado) {
            setCursos(data.cursos || []);
          }
        }
      } catch {
        // Silencioso o mantener lista vacía
      } finally {
        if (!cancelado) setCargandoCursos(false);
      }
    }
    cargarCursos();
    return () => {
      cancelado = true;
    };
  }, [usuario]);

  if (cargando || !usuario) {
    return null;
  }

  return (
    <section aria-labelledby="titulo-principal">
      {/* Indicador de rol del usuario autenticado */}
      <div
        role="status"
        aria-label="Información de sesión activa"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.875rem 1.25rem',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
          Sesión activa: <strong style={{ color: '#0f172a' }}>{usuario.correo || usuario.uid}</strong>
        </span>
        <span
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor:
              rolActivo === 'admin' ? '#fef3c7' : rolActivo === 'docente' ? '#dbeafe' : '#dcfce7',
            color:
              rolActivo === 'admin' ? '#92400e' : rolActivo === 'docente' ? '#1e40af' : '#166534',
          }}
        >
          {rolActivo === 'admin' && '🛡️ Administrador'}
          {rolActivo === 'docente' && '👨‍🏫 Docente'}
          {rolActivo === 'estudiante' && '👨‍🎓 Estudiante'}
        </span>
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <h1
          id="titulo-principal"
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.5rem',
          }}
        >
          {rolActivo === 'docente' && 'Panel del Docente — Mis cursos a cargo'}
          {rolActivo === 'estudiante' && 'Panel del Estudiante — Mis asignaturas'}
          {rolActivo === 'admin' && 'Panel de Control del Administrador'}
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          {rolActivo === 'docente' &&
            'Como docente, gestione las planillas de calificaciones de sus cursos en Firestore y configure las actividades de evaluación.'}
          {rolActivo === 'estudiante' &&
            'Como estudiante, consulte sus calificaciones parciales y su promedio definitivo acumulado registrado en Firestore.'}
          {rolActivo === 'admin' &&
            'Como administrador, gestione los cursos académicos en Firestore, supervise las matrículas y cree nuevos usuarios con sus respectivos roles.'}
        </p>
      </header>

      {/* VISTA EXCLUSIVA DEL ADMINISTRADOR */}
      {rolActivo === 'admin' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
            gap: '1.5rem',
          }}
        >
          <article
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '0.25rem',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Módulo Académico
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                Gestión de Cursos y Matrículas
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                Creación de asignaturas en Firestore, asignación de docentes titulares y supervisión de cursos (RF-01).
              </p>
            </div>
            <Link
              href="/admin/cursos"
              style={{
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
              Administrar Cursos en Firestore →
            </Link>
          </article>

          <article
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '0.25rem',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Módulo de Identidad
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                Creación y Gestión de Usuarios
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                Alta de docentes, estudiantes y administradores en Firebase Authentication con roles inmutables (Custom Claims) y perfiles en Firestore.
              </p>
            </div>
            <Link
              href="/admin/usuarios"
              style={{
                textAlign: 'center',
                padding: '0.625rem 1rem',
                backgroundColor: '#0f172a',
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
              Gestionar Usuarios →
            </Link>
          </article>
        </div>
      ) : (
        /* VISTA PARA DOCENTES Y ESTUDIANTES */
        <div>
          {cargandoCursos ? (
            <div role="status" aria-live="polite" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Cargando cursos desde Firestore...
            </div>
          ) : cursos.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                padding: '2.5rem',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#334155', margin: '0 0 0.5rem 0' }}>
                No hay cursos disponibles en Firestore aún.
              </p>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                {rolActivo === 'docente'
                  ? 'El administrador debe registrar cursos académicos o puede ejecutar el seed inicial.'
                  : 'Consulte con su docente o administrador para matricular sus asignaturas.'}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
                gap: '1.5rem',
              }}
            >
              {cursos.map((curso) => (
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
                        backgroundColor: rolActivo === 'docente' ? '#dbeafe' : '#dcfce7',
                        color: rolActivo === 'docente' ? '#1e40af' : '#166534',
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {rolActivo}
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
                      Periodo: {curso.periodo} · {curso.docenteNombre || 'Docente asignado'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {rolActivo === 'docente' ? (
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
                        Consultar mis notas →
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
