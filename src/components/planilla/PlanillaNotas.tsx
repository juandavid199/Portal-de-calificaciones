'use client';

import React, { useState, useMemo, useId } from 'react';
import { calcularDefinitivoPonderado, type ActividadPonderada } from '@/services/calculoNotas';
import { notaInputSchema, type Actividad, type EstudiantePlanilla } from '@/schemas/notas.schema';
import { useTableKeyboardNav } from '@/hooks/useTableKeyboardNav';

export interface PlanillaDatos {
  curso: string;
  actividades: Actividad[];
  estudiantes: EstudiantePlanilla[];
}

interface PlanillaNotasProps {
  datos: PlanillaDatos;
  onGuardarLote?: (notasActualizadas: Record<string, Record<string, number | null>>) => Promise<void>;
}

/**
 * Componente principal de la planilla de notas:
 * - Tabla semántica HTML (<table>, <caption>, <thead>, <tbody>).
 * - Navegación espacial por matriz con teclas de flecha (WCAG 2.2 AA).
 * - Recálculo reactivo del definitivo ponderado con aritmética exacta vía useMemo.
 * - Validación por celda con Zod y anuncios accesibles vía aria-live.
 */
export function PlanillaNotas({ datos, onGuardarLote: _onGuardarLote }: PlanillaNotasProps) {
  const [estudiantes, setEstudiantes] = useState<EstudiantePlanilla[]>(datos.estudiantes);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [anuncioLive, setAnuncioLive] = useState<string>('');
  const liveRegionId = useId();

  const numRows = estudiantes.length;
  const numCols = datos.actividades.length;

  const { registerCell, handleKeyDown } = useTableKeyboardNav({
    numRows,
    numCols,
  });

  // Mapear actividades a formato ponderado para el servicio
  const actividadesPonderadas: ActividadPonderada[] = useMemo(
    () => datos.actividades.map((a) => ({ id: a.id, porcentaje: a.porcentaje })),
    [datos.actividades]
  );

  // Recalcular los definitivos ponderados mediante useMemo por cada estudiante
  const definitivos = useMemo(() => {
    const mapaDefinitivos: Record<string, number | null> = {};
    for (const est of estudiantes) {
      mapaDefinitivos[est.uid] = calcularDefinitivoPonderado(actividadesPonderadas, est.notas);
    }
    return mapaDefinitivos;
  }, [estudiantes, actividadesPonderadas]);

  const handleChangeNota = (estudianteUid: string, actividadId: string, valorStr: string) => {
    setErrorLocal(null);

    // Permitir campo vacío (nota pendiente / null)
    if (valorStr.trim() === '') {
      setEstudiantes((prev) =>
        prev.map((est) => {
          if (est.uid !== estudianteUid) return est;
          return {
            ...est,
            notas: { ...est.notas, [actividadId]: null },
          };
        })
      );
      setAnuncioLive(`Nota eliminada para estudiante.`);
      return;
    }

    const valorNum = parseFloat(valorStr);
    const validacion = notaInputSchema.safeParse(valorNum);

    if (!validacion.success) {
      const errorMsg = validacion.error.errors[0]?.message || 'Nota inválida';
      setErrorLocal(errorMsg);
      return;
    }

    // Actualizar estado local
    setEstudiantes((prev) =>
      prev.map((est) => {
        if (est.uid !== estudianteUid) return est;
        const nuevasNotas = { ...est.notas, [actividadId]: validacion.data };
        const nuevoDefinitivo = calcularDefinitivoPonderado(actividadesPonderadas, nuevasNotas);
        setAnuncioLive(
          `Nota actualizada para ${est.nombre}: ${validacion.data}. Nuevo definitivo: ${
            nuevoDefinitivo !== null ? nuevoDefinitivo.toFixed(1) : 'Pendiente'
          }`
        );
        return {
          ...est,
          notas: nuevasNotas,
        };
      })
    );
  };

  return (
    <section aria-labelledby="titulo-planilla" style={{ width: '100%' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h2 id="titulo-planilla" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Planilla de Notas: {datos.curso}
        </h2>
        <p style={{ color: '#475569', fontSize: '0.875rem' }}>
          Use las flechas del teclado (↑, ↓, ←, →) para navegar rápidamente entre las celdas de calificación.
        </p>
      </header>

      {/* Región de anuncios accesibles en tiempo real */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {anuncioLive}
      </div>

      {errorLocal && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {errorLocal}
        </div>
      )}

      {/* Contenedor responsivo con scroll horizontal si es necesario */}
      <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}>
        <table
          style={{
            width: '100%',
            minWidth: '38rem',
            borderCollapse: 'collapse',
            backgroundColor: '#ffffff',
            textAlign: 'left',
          }}
        >
          <caption style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600, color: '#334155' }}>
            Registro de notas por actividad académica
          </caption>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th scope="col" style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                Estudiante
              </th>
              {datos.actividades.map((act) => (
                <th
                  key={act.id}
                  scope="col"
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    textAlign: 'center',
                  }}
                >
                  {act.nombre}
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      color: '#64748b',
                    }}
                  >
                    ({act.porcentaje}%)
                  </span>
                </th>
              ))}
              <th
                scope="col"
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  textAlign: 'center',
                }}
              >
                Definitivo
              </th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((estudiante, rowIndex) => {
              const def = definitivos[estudiante.uid];
              return (
                <tr
                  key={estudiante.uid}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc',
                  }}
                >
                  <th
                    scope="row"
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 500,
                      color: '#0f172a',
                    }}
                  >
                    {estudiante.nombre}
                  </th>
                  {datos.actividades.map((actividad, colIndex) => {
                    const valorNota = estudiante.notas[actividad.id];
                    const labelId = `label-${estudiante.uid}-${actividad.id}`;
                    return (
                      <td
                        key={actividad.id}
                        style={{
                          padding: '0.5rem 0.75rem',
                          textAlign: 'center',
                        }}
                      >
                        <input
                          id={labelId}
                          ref={registerCell(rowIndex, colIndex)}
                          type="text"
                          inputMode="decimal"
                          value={valorNota !== null && valorNota !== undefined ? valorNota.toString() : ''}
                          aria-label={`${estudiante.nombre} - ${actividad.nombre}`}
                          onChange={(e) => handleChangeNota(estudiante.uid, actividad.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
                          style={{
                            width: '4rem',
                            textAlign: 'center',
                            padding: '0.375rem 0.25rem',
                            border: '1px solid #94a3b8',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            outlineColor: '#2563eb',
                          }}
                        />
                      </td>
                    );
                  })}
                  <td
                    aria-label={`Definitivo ${estudiante.nombre}`}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: def !== null && def < 3.0 ? '#dc2626' : '#16a34a',
                      fontSize: '1rem',
                    }}
                  >
                    {def !== null ? def.toFixed(1) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

