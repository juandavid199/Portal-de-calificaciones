import { z } from 'zod';

export const rolUsuarioEnum = z.enum(['docente', 'estudiante', 'admin'], {
  errorMap: () => ({ message: 'El rol debe ser docente, estudiante o admin.' }),
});

export const crearUsuarioSchema = z.object({
  correo: z.string().email('Correo electrónico inválido.'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  rol: rolUsuarioEnum,
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;

