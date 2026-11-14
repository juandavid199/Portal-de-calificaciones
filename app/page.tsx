'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { RolUsuario } from '@/lib/auth';

interface CursoItem {
  id: string;
  nombre: string;
  periodo: string;
  docente: string;
  rol: 'docente' | 'estudiante';
  cerrado: boolean;
}

const CURSOS_DEMO: CursoItem[] = [
  {
    id: 'demo-1',
    nombre: 'Desarrollo Web Full Stack - Portal de Calificaciones',
    periodo: '2026-2',
    docente: 'Prof. Carlos Mendoza',
    rol: 'docente',
    cerrado: false,
  },
  {
    id: 'demo-2',
    nombre: 'Arquitectura de Software y Seguridad',
    periodo: '2026-2',
    docente: 'Dra. Luisa Ortega',
    rol: 'estudiante',
    cerrado: false,
  },
];

export default function PaginaMisCursos() {
  const { usuario, rol: rolAuth } = useAuth();
  // Permite conmutar el rol para pruebas/demostración si no hay usuario autenticado o para cambiar de perspectiva
  const [rolSimulado, setRolSimulado] = useState<RolUsuario>('docente');

  const rolActivo: RolUsuario = rolAuth || rolSimulado;

  // Filtrar los cursos según el rol activo
  const cursosFiltrados = CURSOS_DEMO.filter((c) => {
    if (rolActivo === 'admin') return true;
    return c.rol === rolActivo;
  });

  return (
    <section aria-labelledby="titulo-mis-cursos">
      {/* Barra de Conmutación de Roles para Sustentación y Pruebas */}
      <div
        role="region"
        aria-label="Selector de rol para demostración"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
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
          Vista activa del sistema:
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['docente', 'estudiante', 'admin'] as RolUsuario[]).map((r) => {
            const esActivo = rolActivo === r;
            const iconos = { docente: '👨‍🏫 Docente', estudiante: '👨‍🎓 Estudiante', admin: '🛡️ Administrador' };
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRolSimulado(r)}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: esActivo ? 700 : 500,
                  backgroundColor: esActivo ? '#1e293b' : '#f1f5f9',
                  color: esActivo ? '#ffffff' : '#475569',
                  border: esActivo ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  minHeight: '2.5rem',
                }}
              >
                {iconos[r]}
              </button>
            );
          })}
        </div>
      </div>

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
          {rolActivo === 'docente' && 'Panel del Docente — Mis cursos a cargo'}
          {rolActivo === 'estudiante' && 'Panel del Estudiante — Mis asignaturas matriculadas'}
          {rolActivo === 'admin' && 'Panel de Administración — Gestión global de cursos'}
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          {rolActivo === 'docente' &&
            'Como docente, puede gestionar las planillas de calificaciones de sus cursos y configurar los porcentajes de evaluación.'}
          {rolActivo === 'estudiante' &&
            'Como estudiante, consulte sus calificaciones parciales y su promedio definitivo acumulado.'}
          {rolActivo === 'admin' &&
            'Como administrador, gestione los cursos académicos, asigne docentes y supervise matrículas.'}
        </p>
      </header>

      {/* Si es rol Admin, mostrar acceso rápido al módulo de administración */}
      {rolActivo === 'admin' && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#1e40af' }}>
              Módulo de Administración Académica
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#3b82f6' }}>
              Creación de cursos y asignación de matrículas estudiantiles (RF-01).
            </p>
          </div>
          <Link
            href="/admin/cursos"
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              minHeight: '2.5rem',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Ir a Gestión de Cursos →
          </Link>
        </div>
      )}

      {/* Listado de cursos filtrados por rol */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
          gap: '1.5rem',
        }}
      >
        {cursosFiltrados.map((curso) => (
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
                Periodo: {curso.periodo} · {curso.docente}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {rolActivo === 'docente' || rolActivo === 'admin' ? (
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
    </section>
  );
}
