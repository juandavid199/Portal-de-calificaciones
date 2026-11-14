'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlanillaDatos } from '@/components/planilla/PlanillaNotas';

interface UsePlanillaNotasOptions {
  cursoId: string;
  simularError?: boolean;
  simularVacio?: boolean;
}

export type EstadoPlanilla = 'loading' | 'error' | 'empty' | 'success';

/**
 * Hook para consumir la planilla de notas conectada a Firestore vía API.
 * Gestiona los 4 estados canónicos de la interfaz: carga, error, vacío y éxito.
 */
export function usePlanillaNotas({
  cursoId,
  simularError = false,
  simularVacio = false,
}: UsePlanillaNotasOptions) {
  const [estado, setEstado] = useState<EstadoPlanilla>('loading');
  const [datos, setDatos] = useState<PlanillaDatos | null>(null);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setEstado('loading');
    setErrorMensaje(null);

    try {
      if (simularError) {
        throw new Error('Error al conectar con la base de datos de calificaciones.');
      }

      if (simularVacio) {
        setDatos({
          curso: 'Curso Vacío',
          actividades: [],
          estudiantes: [],
        });
        setEstado('empty');
        return;
      }

      const res = await fetch(`/api/cursos/${encodeURIComponent(cursoId)}/notas`, {
        method: 'GET',
        headers: { credentials: 'same-origin' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Error al obtener la planilla (${res.status})`);
      }

      const data = await res.json();

      if (!data.estudiantes || (data.estudiantes.length === 0 && data.actividades.length === 0)) {
        setDatos({
          curso: data.curso || `Curso ${cursoId}`,
          actividades: data.actividades || [],
          estudiantes: [],
        });
        setEstado('empty');
        return;
      }

      setDatos({
        curso: data.curso,
        actividades: data.actividades || [],
        estudiantes: data.estudiantes || [],
      });
      setEstado('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al cargar la planilla';
      setErrorMensaje(msg);
      setEstado('error');
    }
  }, [cursoId, simularError, simularVacio]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    estado,
    datos,
    errorMensaje,
    reintentar: cargarDatos,
  };
}

