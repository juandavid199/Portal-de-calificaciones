import { z } from 'zod';

/**
 * Esquema de validación para una nota individual:
 * - Debe ser un número entre 0.0 y 5.0.
 * - Solo admite hasta un decimal (sin centésimas ni milésimas).
 */
export const notaInputSchema = z
  .number({
    required_error: 'La nota es obligatoria',
    invalid_type_error: 'La nota debe ser un número',
  })
  .min(0.0, { message: 'La nota mínima es 0.0' })
  .max(5.0, { message: 'La nota máxima es 5.0' })
  .refine(
    (val) => {
      // Verifica que no tenga más de 1 decimal
      const str = val.toString();
      const parts = str.split('.');
      if (parts.length > 1) {
        return parts[1].length <= 1;
      }
      return true;
    },
    { message: 'La nota debe tener como máximo un decimal' }
  );

/**
 * Esquema de validación para una actividad académica individual.
 */
export const actividadSchema = z.object({
  id: z.string().min(1, 'El id de la actividad es requerido'),
  nombre: z.string().min(1, 'El nombre de la actividad es requerido'),
  porcentaje: z
    .number({ invalid_type_error: 'El porcentaje debe ser un número' })
    .int('El porcentaje debe ser un entero')
    .min(1, 'El porcentaje debe ser mayor a 0%')
    .max(100, 'El porcentaje no puede superar 100%'),
});

/**
 * Esquema para la lista de actividades del curso:
 * - Valida que la suma de porcentajes sea exactamente igual a 100%.
 */
export const actividadesListSchema = z
  .array(actividadSchema)
  .min(1, 'Debe haber al menos una actividad registrada')
  .refine(
    (actividades) => {
      const suma = actividades.reduce((acc, act) => acc + act.porcentaje, 0);
      return suma === 100;
    },
    { message: 'Los porcentajes de las actividades deben sumar exactamente 100%' }
  );

/**
 * Esquema para las notas de un estudiante matriculado.
 */
export const estudiantePlanillaSchema = z.object({
  uid: z.string().min(1, 'El UID del estudiante es obligatorio'),
  nombre: z.string().min(1, 'El nombre del estudiante es obligatorio'),
  notas: z.record(z.string(), notaInputSchema.nullable()),
});

/**
 * Esquema para la planilla completa de un curso.
 */
export const planillaCursoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  actividades: actividadesListSchema,
  estudiantes: z.array(estudiantePlanillaSchema),
});

export type NotaInput = z.infer<typeof notaInputSchema>;
export type Actividad = z.infer<typeof actividadSchema>;
export type EstudiantePlanilla = z.infer<typeof estudiantePlanillaSchema>;
export type PlanillaCurso = z.infer<typeof planillaCursoSchema>;

