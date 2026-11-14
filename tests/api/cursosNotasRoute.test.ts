import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from '@/app/api/cursos/[id]/notas/route';
import * as authLib from '@/lib/auth';
import * as notasService from '@/services/notasService';
import { ConflictError, ForbiddenError } from '@/lib/errores';

vi.mock('@/lib/auth');
vi.mock('@/services/notasService');

describe('PUT /api/cursos/:id/notas - Contrato REST y Manejo de Errores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Error 400 de validación Zod (nota > 5.0)
  it('retorna 400 con detalle de campo cuando los datos no cumplen el esquema Zod', async () => {
    vi.spyOn(authLib, 'requerirUsuario').mockResolvedValue({
      uid: 'docente-1',
      correo: 'docente@portal.edu.co',
      rol: 'docente',
    });

    const request = new Request('http://localhost:3000/api/cursos/curso-1/notas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cambios: [
          {
            estudianteUid: 'est-1',
            actividadId: 'act-1',
            valor: 5.5, // INVÁLIDO: mayor a 5.0
          },
        ],
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'curso-1' }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Error de validación');
    expect(json.detalles).toBeDefined();
    expect(json.detalles[0].campo).toContain('cambios.0.valor');
    expect(json.detalles[0].mensaje).toMatch(/la nota máxima es 5.0/i);
  });

  // Test 2: Error 409 de conflicto (curso cerrado sin justificación)
  it('retorna 409 Conflicto si el curso está cerrado y no se suministra justificación', async () => {
    vi.spyOn(authLib, 'requerirUsuario').mockResolvedValue({
      uid: 'docente-1',
      correo: 'docente@portal.edu.co',
      rol: 'docente',
    });

    vi.spyOn(notasService, 'actualizarNotasLote').mockRejectedValue(
      new ConflictError('El curso está cerrado. Se requiere una justificación válida para editar notas.')
    );

    const request = new Request('http://localhost:3000/api/cursos/curso-1/notas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cambios: [
          {
            estudianteUid: 'est-1',
            actividadId: 'act-1',
            valor: 4.5,
          },
        ],
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'curso-1' }) });
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toBe('El curso está cerrado. Se requiere una justificación válida para editar notas.');
  });

  // Test 3: Error 403 Prohibido si un estudiante intenta editar notas
  it('retorna 403 Prohibido si un usuario con rol estudiante intenta modificar notas', async () => {
    vi.spyOn(authLib, 'requerirUsuario').mockRejectedValue(
      new ForbiddenError('No tiene permisos para modificar notas en este curso.')
    );

    const request = new Request('http://localhost:3000/api/cursos/curso-1/notas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cambios: [{ estudianteUid: 'est-1', actividadId: 'act-1', valor: 4.0 }],
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'curso-1' }) });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/no tiene permisos/i);
  });
});

