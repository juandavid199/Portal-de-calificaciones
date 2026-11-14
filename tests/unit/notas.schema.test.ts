import { describe, it, expect } from 'vitest';
import { notaInputSchema, actividadesListSchema } from '@/schemas/notas.schema';

describe('Validaciones de esquema Zod para notas y actividades', () => {
  it('acepta notas válidas con un solo decimal entre 0.0 y 5.0', () => {
    expect(notaInputSchema.safeParse(0.0).success).toBe(true);
    expect(notaInputSchema.safeParse(2.5).success).toBe(true);
    expect(notaInputSchema.safeParse(5.0).success).toBe(true);
  });

  it('rechaza notas menores a 0.0 o mayores a 5.0', () => {
    const bajo = notaInputSchema.safeParse(-0.1);
    expect(bajo.success).toBe(false);

    const alto = notaInputSchema.safeParse(5.1);
    expect(alto.success).toBe(false);
  });

  it('rechaza notas con más de un decimal', () => {
    const dosDecimales = notaInputSchema.safeParse(3.55);
    expect(dosDecimales.success).toBe(false);

    const tresDecimales = notaInputSchema.safeParse(4.123);
    expect(tresDecimales.success).toBe(false);
  });

  it('valida que la suma de porcentajes de las actividades sea exactamente 100%', () => {
    const validas = [
      { id: 'act1', nombre: 'Taller', porcentaje: 40 },
      { id: 'act2', nombre: 'Parcial', porcentaje: 60 },
    ];
    expect(actividadesListSchema.safeParse(validas).success).toBe(true);

    const invalidasSumaMenor = [
      { id: 'act1', nombre: 'Taller', porcentaje: 40 },
      { id: 'act2', nombre: 'Parcial', porcentaje: 50 },
    ];
    expect(actividadesListSchema.safeParse(invalidasSumaMenor).success).toBe(false);

    const invalidasSumaMayor = [
      { id: 'act1', nombre: 'Taller', porcentaje: 50 },
      { id: 'act2', nombre: 'Parcial', porcentaje: 60 },
    ];
    expect(actividadesListSchema.safeParse(invalidasSumaMayor).success).toBe(false);
  });
});

