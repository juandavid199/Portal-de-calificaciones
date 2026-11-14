'use client';

import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { BotonVolver } from '@/components/common/BotonVolver';
import { actividadesListSchema, type Actividad } from '@/schemas/notas.schema';

interface PaginaActividadesProps {
  params: Promise<{ id: string }>;
}

const ACTIVIDADES_INICIALES: Actividad[] = [
  { id: 'act-1', nombre: 'Taller 1: Accesibilidad y HTML Semántico', porcentaje: 30 },
  { id: 'act-2', nombre: 'Parcial 1: APIs y Seguridad', porcentaje: 30 },
  { id: 'act-3', nombre: 'Proyecto Final: Portal con Firestore', porcentaje: 40 },
];

export default function PaginaActividadesCurso({ params }: PaginaActividadesProps) {
  const resolvedParams = use(params);
  const cursoId = resolvedParams.id;

  const [actividades, setActividades] = useState<Actividad[]>(ACTIVIDADES_INICIALES);
  const [nuevaNombre, setNuevaNombre] = useState('');
  const [nuevoPorcentaje, setNuevoPorcentaje] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const sumaPorcentajes = useMemo(
    () => actividades.reduce((acc, act) => acc + act.porcentaje, 0),
    [actividades]
  );

  const esValido100 = sumaPorcentajes === 100;

  const handleEliminar = (id: string) => {
    setActividades((prev) => prev.filter((a) => a.id !== id));
    setMensajeEstado(null);
  };

  const handleAgregar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeEstado(null);

    const porc = parseInt(nuevoPorcentaje, 10);
    if (!nuevaNombre.trim()) {
      setMensajeEstado({ tipo: 'error', texto: 'El nombre de la actividad es requerido.' });
      return;
    }

    if (isNaN(porc) || porc <= 0 || porc > 100) {
      setMensajeEstado({ tipo: 'error', texto: 'El porcentaje debe ser un entero entre 1% y 100%.' });
      return;
    }

    const nuevaActividad: Actividad = {
      id: `act-${Date.now()}`,
      nombre: nuevaNombre.trim(),
      porcentaje: porc,
    };

    const listaTentativa = [...actividades, nuevaActividad];
    setActividades(listaTentativa);
    setNuevaNombre('');
    setNuevoPorcentaje('');
  };

  const handleGuardarConfiguracion = () => {
    const validacion = actividadesListSchema.safeParse(actividades);
    if (!validacion.success) {
      setMensajeEstado({
        tipo: 'error',
        texto: validacion.error.errors[0]?.message || 'La suma de los porcentajes debe ser exactamente 100%.',
      });
      return;
    }

    setMensajeEstado({
      tipo: 'exito',
      texto: '¡Configuración de actividades guardada exitosamente!',
    });
  };

  return (
    <section aria-labelledby="titulo-actividades">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <nav aria-label="Miga de pan">
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
            <li>
              <Link href={`/docente/cursos/${cursoId}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                Planilla ({cursoId})
              </Link>
              <span aria-hidden="true" style={{ margin: '0 0.5rem' }}>/</span>
            </li>
            <li aria-current="page" style={{ fontWeight: 600, color: '#0f172a' }}>
              Actividades y porcentajes
            </li>
          </ol>
        </nav>
        <BotonVolver href={`/docente/cursos/${cursoId}`} texto="Volver a la planilla" />
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <h1
          id="titulo-actividades"
          style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}
        >
          Actividades y porcentajes del curso
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '65ch', margin: 0 }}>
          Defina las actividades evaluativas y sus respectivos porcentajes. La suma debe dar exactamente 100%.
        </p>
      </header>

      {/* Alerta de estado */}
      {mensajeEstado && (
        <div
          role="alert"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
            backgroundColor: mensajeEstado.tipo === 'exito' ? '#ecfdf5' : '#fef2f2',
            color: mensajeEstado.tipo === 'exito' ? '#065f46' : '#991b1b',
            border: `1px solid ${mensajeEstado.tipo === 'exito' ? '#a7f3d0' : '#fca5a5'}`,
            fontWeight: 500,
          }}
        >
          {mensajeEstado.texto}
        </div>
      )}

      {/* Resumen del total con anuncio dinámico */}
      <div
        aria-live="polite"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: esValido100 ? '#f0fdf4' : '#fffbeb',
          border: `1px solid ${esValido100 ? '#bbf7d0' : '#fde68a'}`,
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontWeight: 600, color: '#1e293b' }}>
          Suma total de porcentajes:
        </span>
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: esValido100 ? '#16a34a' : '#d97706',
          }}
        >
          {sumaPorcentajes}% {esValido100 ? '(Válido)' : '(Debe sumar 100%)'}
        </span>
      </div>

      {/* Lista de actividades existentes */}
      <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
          <caption style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>
            Actividades configuradas
          </caption>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>
                Nombre de la actividad
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                Porcentaje (%)
              </th>
              <th scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((act, idx) => (
              <tr
                key={act.id}
                style={{
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                }}
              >
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#0f172a' }}>
                  {act.nombre}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                  {act.porcentaje}%
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleEliminar(act.id)}
                    aria-label={`Eliminar actividad ${act.nombre}`}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario accesible para agregar nueva actividad */}
      <form
        onSubmit={handleAgregar}
        style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #cbd5e1',
          marginBottom: '2rem',
        }}
      >
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            Agregar nueva actividad evaluativa
          </legend>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: '2 1 14rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="nombre-actividad" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                Nombre de la actividad
              </label>
              <input
                id="nombre-actividad"
                type="text"
                value={nuevaNombre}
                onChange={(e) => setNuevaNombre(e.target.value)}
                placeholder="Ej. Taller 2: React Server Components"
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

            <div style={{ flex: '1 1 8rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="porcentaje-actividad" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                Porcentaje (%)
              </label>
              <input
                id="porcentaje-actividad"
                type="number"
                min="1"
                max="100"
                value={nuevoPorcentaje}
                onChange={(e) => setNuevoPorcentaje(e.target.value)}
                placeholder="Ej. 20"
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
              + Agregar actividad
            </button>
          </div>
        </fieldset>
      </form>

      {/* Botón de guardado final */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleGuardarConfiguracion}
          disabled={!esValido100}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: esValido100 ? '#16a34a' : '#94a3b8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: esValido100 ? 'pointer' : 'not-allowed',
            minHeight: '2.75rem',
          }}
        >
          Guardar configuración de porcentajes
        </button>

        <Link
          href={`/docente/cursos/${cursoId}`}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            textDecoration: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: 600,
            border: '1px solid #cbd5e1',
            minHeight: '2.75rem',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Volver a la planilla
        </Link>
      </div>
    </section>
  );
}

