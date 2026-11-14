import { describe, it, expect } from 'vitest';
import { crearUsuarioSchema } from '@/schemas/usuario.schema';

describe('crearUsuarioSchema - Validación de creación de usuarios (Admin)', () => {
  it('valida con éxito un payload de usuario completo con rol docente', () => {
    const payload = {
      correo: 'profesor.nuevo@portal.edu.co',
      nombre: 'Prof. Carlos Mendoza',
      contrasena: 'Profesor2026*',
      rol: 'docente',
    };

    const resultado = crearUsuarioSchema.safeParse(payload);
    expect(resultado.success).toBe(true);
  });

  it('valida con éxito un payload con rol estudiante', () => {
    const payload = {
      correo: 'estudiante.nuevo@portal.edu.co',
      nombre: 'Ana Sofía Gómez',
      contrasena: 'Estudiante123!',
      rol: 'estudiante',
    };

    const resultado = crearUsuarioSchema.safeParse(payload);
    expect(resultado.success).toBe(true);
  });

  it('rechaza correos con formato inválido', () => {
    const payload = {
      correo: 'correo-no-valido',
      nombre: 'Pedro Pérez',
      contrasena: 'ClaveSegura123',
      rol: 'estudiante',
    };

    const resultado = crearUsuarioSchema.safeParse(payload);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.errors[0]?.message).toMatch(/correo electrónico inválido/i);
    }
  });

  it('rechaza contraseñas con menos de 6 caracteres', () => {
    const payload = {
      correo: 'admin@portal.edu.co',
      nombre: 'Super Admin',
      contrasena: '123',
      rol: 'admin',
    };

    const resultado = crearUsuarioSchema.safeParse(payload);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.errors[0]?.message).toMatch(/al menos 6 caracteres/i);
    }
  });

  it('rechaza roles no admitidos en el sistema', () => {
    const payload = {
      correo: 'otro@portal.edu.co',
      nombre: 'Usuario Fantasma',
      contrasena: 'Clave12345',
      rol: 'moderador_invalido',
    };

    const resultado = crearUsuarioSchema.safeParse(payload);
    expect(resultado.success).toBe(false);
  });
});

