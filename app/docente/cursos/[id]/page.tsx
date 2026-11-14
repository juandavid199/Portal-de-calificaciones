'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { BotonVolver } from '@/components/common/BotonVolver';
import { usePlanillaNotas } from '@/hooks/usePlanillaNotas';
import { PlanillaNotas } from '@/components/planilla/PlanillaNotas';
import { PlanillaSkeleton } from '@/components/planilla/PlanillaSkeleton';
import { PlanillaError } from '@/components/planilla/PlanillaError';
import { PlanillaVacia } from '@/components/planilla/PlanillaVacia';

interface PaginaPlanillaProps {
  params: Promise<{ id: string }>;
}

export default function PaginaPlanillaCurso({ params }: PaginaPlanillaProps) {
  const resolvedParams = use(params);
  const cursoId = resolvedParams.id;

  const { estado, datos, errorMensaje, reintentar } = usePlanillaNotas({
    cursoId,
  });

  const handleGuardarLote = async (mapa: Record<string, Record<string, number | null>>) => {
    const cambios: { estudianteUid: string; actividadId: string; valor: number | null }[] = [];
    for (const [estudianteUid, actividades] of Object.entries(mapa)) {
      for (const [actividadId, valor] of Object.entries(actividades)) {
        cambios.push({ estudianteUid, actividadId, valor });
      }
    }

    const res = await fetch(`/api/cursos/${encodeURIComponent(cursoId)}/notas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cambios,
        justificacion: 'Actualización docente desde la planilla en vivo',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Error ${res.status} al guardar notas.`);
    }
  };

  return (
    <div>
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
              Planilla de notas ({cursoId})
            </li>
          </ol>
        </nav>
        <BotonVolver href="/" texto="Volver a mis cursos" />
      </div>

      {estado === 'loading' && <PlanillaSkeleton />}
      {estado === 'error' && (
        <PlanillaError mensaje={errorMensaje || undefined} onReintentar={reintentar} />
      )}
      {estado === 'empty' && <PlanillaVacia />}
      {estado === 'success' && datos && (
        <div>
          <PlanillaNotas datos={datos} onGuardarLote={handleGuardarLote} />
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <Link
              href={`/docente/cursos/${cursoId}/actividades`}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#f1f5f9',
                color: '#1e293b',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                minHeight: '2.75rem',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Configurar actividades y porcentajes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

