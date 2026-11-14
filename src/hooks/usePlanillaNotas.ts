'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlanillaDatos } from '@/components/planilla/PlanillaNotas';

interface UsePlanillaNotasOptions {
  cursoId: string;
  simularError?: boolean;
  simularVacio?: boolean;
}

export type EstadoPlanilla = 'loading' | 'error' | 'empty' | 'success';

const MOCK_PLANILLA_INICIAL: PlanillaDatos = {
  curso: 'Desarrollo Web - 50 Portal de Calificaciones',
  actividades: [
    { id: 'act-1', nombre: 'Taller 1: Accesibilidad y HTML Semántico', porcentaje: 30 },
    { id: 'act-2', nombre: 'Parcial 1: APIs y Seguridad', porcentaje: 30 },
    { id: 'act-3', nombre: 'Proyecto Final: Portal con Firestore', porcentaje: 40 },
  ],
  estudiantes: [
    {
      uid: 'est-001',
      nombre: 'Camila Morales',
      notas: { 'act-1': 4.5, 'act-2': 4.0, 'act-3': 4.8 },
    },
    {
      uid: 'est-002',
      nombre: 'Mateo Gómez',
      notas: { 'act-1': 3.2, 'act-2': 2.8, 'act-3': 3.5 },
    },
    {
      uid: 'est-003',
      nombre: 'Sofía Herrera',
      notas: { 'act-1': 5.0, 'act-2': 4.8, 'act-3': 5.0 },
    },
    {
      uid: 'est-004',
      nombre: 'Juan David Ramírez',
      notas: { 'act-1': 3.8, 'act-2': 3.5, 'act-3': null },
    },
  ],
};

/**
 * Hook para consumir la planilla de notas simulando un fetch con promesa.
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
      // Simular latencia de red de 400ms
      await new Promise((resolve) => setTimeout(resolve, 400));

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

      setDatos(MOCK_PLANILLA_INICIAL);
      setEstado('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al cargar la planilla';
      setErrorMensaje(msg);
      setEstado('error');
    }
  }, [simularError, simularVacio]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos, cursoId]);

  return {
    estado,
    datos,
    errorMensaje,
    reintentar: cargarDatos,
  };
}

