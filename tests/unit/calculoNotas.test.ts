import { describe, it, expect } from 'vitest';
import { calcularDefinitivoPonderado, type ActividadPonderada } from '@/services/calculoNotas';

describe('Cálculo del definitivo ponderado (Aritmética exacta en décimas)', () => {
  // Caso 1: Caso típico ponderado (30%, 30%, 40%)
  it('calcula correctamente el ponderado típico con un decimal sin errores', () => {
    const actividades: ActividadPonderada[] = [
      { id: 'act1', porcentaje: 30 },
      { id: 'act2', porcentaje: 30 },
      { id: 'act3', porcentaje: 40 },
    ];
    const notas = { act1: 3.5, act2: 4.0, act3: 4.5 };
    // 3.5*0.3 (1.05) + 4.0*0.3 (1.20) + 4.5*0.4 (1.80) = 4.05 -> redondeo simétrico a 4.1
    expect(calcularDefinitivoPonderado(actividades, notas)).toBe(4.1);
  });

  // Caso 2: Trampa de punto flotante IEEE 754 (0.1 y 0.2 al 50%)
  it('evita errores de redondeo de punto flotante en décimas críticas (ej. 0.1 + 0.2)', () => {
    const actividades: ActividadPonderada[] = [
      { id: 'act1', porcentaje: 50 },
      { id: 'act2', porcentaje: 50 },
    ];
    const notas = { act1: 0.1, act2: 0.2 };
    // (0.1 * 50 + 0.2 * 50) / 100 = (5 + 10) / 100 = 0.15 -> 0.2 en décimas exactas
    expect(calcularDefinitivoPonderado(actividades, notas)).toBe(0.2);
  });

  // Caso 3: Límite inferior (todas las notas en 0.0)
  it('retorna 0.0 cuando todas las notas son 0.0', () => {
    const actividades: ActividadPonderada[] = [
      { id: 'act1', porcentaje: 60 },
      { id: 'act2', porcentaje: 40 },
    ];
    const notas = { act1: 0.0, act2: 0.0 };
    expect(calcularDefinitivoPonderado(actividades, notas)).toBe(0.0);
  });

  // Caso 4: Límite superior (todas las notas en 5.0)
  it('retorna 5.0 cuando todas las notas son 5.0', () => {
    const actividades: ActividadPonderada[] = [
      { id: 'act1', porcentaje: 50 },
      { id: 'act2', porcentaje: 50 },
    ];
    const notas = { act1: 5.0, act2: 5.0 };
    expect(calcularDefinitivoPonderado(actividades, notas)).toBe(5.0);
  });

  // Caso 5: Actividades pendientes / incompletas (valores null)
  it('retorna null si alguna de las actividades requeridas no tiene nota asignada', () => {
    const actividades: ActividadPonderada[] = [
      { id: 'act1', porcentaje: 50 },
      { id: 'act2', porcentaje: 50 },
    ];
    const notas = { act1: 4.5, act2: null };
    expect(calcularDefinitivoPonderado(actividades, notas)).toBeNull();
  });

  // Caso 6: Validación de integridad de porcentajes (debe sumar exactamente 100%)
  it('lanza un error si los porcentajes de las actividades no suman 100%', () => {
    const actividadesInvalidas: ActividadPonderada[] = [
      { id: 'act1', porcentaje: 40 },
      { id: 'act2', porcentaje: 50 }, // Suma 90%
    ];
    const notas = { act1: 4.0, act2: 3.5 };
    expect(() => calcularDefinitivoPonderado(actividadesInvalidas, notas)).toThrow(
      'Los porcentajes de las actividades deben sumar exactamente 100%'
    );
  });
});

