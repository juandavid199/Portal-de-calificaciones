import { z } from 'zod';
import { notaInputSchema, actividadesListSchema } from './notas.schema';

/**
 * Esquema de validación para actualizar notas por lote (PUT /api/cursos/:id/notas).
 */
export const cambioNotaItemSchema = z.object({
  estudianteUid: z.string().min(1, 'El UID del estudiante es obligatorio'),
  actividadId: z.string().min(1, 'El ID de la actividad es obligatorio'),
  valor: notaInputSchema.nullable(),
});

export const actualizarNotasPayloadSchema = z.object({
  cambios: z
    .array(cambioNotaItemSchema)
    .min(1, 'Debe incluir al menos un cambio de nota en el lote'),
  justificacion: z.string().min(5, 'La justificación debe tener al menos 5 caracteres').optional(),
});

/**
 * Esquema para cerrar un curso (POST /api/cursos/:id/cerrar).
 */
export const cerrarCursoPayloadSchema = z.object({
  confirmacion: z.literal(true, {
    errorMap: () => ({ message: 'Debe confirmar explícitamente el cierre del curso' }),
  }),
});

/**
 * Esquema para crear un curso (POST /api/cursos).
 */
export const crearCursoPayloadSchema = z.object({
  nombre: z.string().min(3, 'El nombre del curso debe tener al menos 3 caracteres'),
  docenteUid: z.string().min(1, 'El UID del docente es obligatorio').optional().default('docente-1'),
  docenteNombre: z.string().optional(),
  periodo: z.string().min(1, 'El periodo académico es obligatorio'),
  actividades: actividadesListSchema.optional(),
});

/**
 * Esquema para crear cookie de sesión (POST /api/auth/sesion).
 */
export const crearSesionPayloadSchema = z.object({
  idToken: z.string().min(10, 'El idToken es obligatorio'),
});

export type ActualizarNotasPayload = z.infer<typeof actualizarNotasPayloadSchema>;
export type CambioNotaItem = z.infer<typeof cambioNotaItemSchema>;
export type CerrarCursoPayload = z.infer<typeof cerrarCursoPayloadSchema>;
export type CrearCursoPayload = z.infer<typeof crearCursoPayloadSchema>;
export type CrearSesionPayload = z.infer<typeof crearSesionPayloadSchema>;

