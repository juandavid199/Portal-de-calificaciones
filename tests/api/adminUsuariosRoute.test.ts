import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/admin/usuarios/route';
import * as authLib from '@/lib/auth';
import * as usuarioService from '@/services/usuarioService';
import { ForbiddenError } from '@/lib/errores';

vi.mock('@/lib/auth');
vi.mock('@/services/usuarioService');

describe('API Admin Usuarios (/api/admin/usuarios)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/admin/usuarios - Creación de Usuarios', () => {
    it('retorna 403 Prohibido si el usuario no tiene rol admin', async () => {
      vi.spyOn(authLib, 'requerirUsuario').mockRejectedValue(
        new ForbiddenError('Acceso denegado: solo admin.')
      );

      const request = new Request('http://localhost:3000/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: 'docente@portal.edu.co',
          nombre: 'Profesor Carlos',
          contrasena: 'ClaveSegura123',
          rol: 'docente',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('retorna 400 Bad Request si los datos del usuario son inválidos', async () => {
      vi.spyOn(authLib, 'requerirUsuario').mockResolvedValue({
        uid: 'admin-1',
        correo: 'admin@portal.edu.co',
        rol: 'admin',
      });

      const request = new Request('http://localhost:3000/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: 'correo_invalido',
          nombre: '',
          contrasena: '123',
          rol: 'rol_no_existe',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Error de validación');
    });

    it('crea el usuario exitosamente y retorna 201 Created', async () => {
      vi.spyOn(authLib, 'requerirUsuario').mockResolvedValue({
        uid: 'admin-1',
        correo: 'admin@portal.edu.co',
        rol: 'admin',
      });

      const mockCreado = {
        uid: 'usr-nuevo-123',
        correo: 'docente.nuevo@portal.edu.co',
        nombre: 'Dr. Roberto Gómez',
        rol: 'docente' as const,
        creadoEn: '2026-11-14T12:00:00.000Z',
      };

      vi.spyOn(usuarioService, 'registrarNuevoUsuario').mockResolvedValue(mockCreado);

      const request = new Request('http://localhost:3000/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: 'docente.nuevo@portal.edu.co',
          nombre: 'Dr. Roberto Gómez',
          contrasena: 'Docente2026*',
          rol: 'docente',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.mensaje).toMatch(/usuario creado exitosamente/i);
      expect(json.usuario.uid).toBe('usr-nuevo-123');
      expect(json.usuario.rol).toBe('docente');
    });
  });

  describe('GET /api/admin/usuarios - Listado de Usuarios', () => {
    it('retorna 200 OK con el listado de usuarios para el administrador', async () => {
      vi.spyOn(authLib, 'requerirUsuario').mockResolvedValue({
        uid: 'admin-1',
        correo: 'admin@portal.edu.co',
        rol: 'admin',
      });

      const mockUsuarios = [
        {
          uid: 'u-1',
          correo: 'docente@portal.edu.co',
          nombre: 'Carlos Mendoza',
          rol: 'docente' as const,
          creadoEn: '2026-11-14T10:00:00.000Z',
        },
        {
          uid: 'u-2',
          correo: 'estudiante@portal.edu.co',
          nombre: 'Laura Rojas',
          rol: 'estudiante' as const,
          creadoEn: '2026-11-14T10:05:00.000Z',
        },
      ];

      vi.spyOn(usuarioService, 'obtenerUsuariosSistema').mockResolvedValue(mockUsuarios);

      const request = new Request('http://localhost:3000/api/admin/usuarios', {
        method: 'GET',
      });

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.usuarios).toHaveLength(2);
      expect(json.usuarios[0].nombre).toBe('Carlos Mendoza');
    });
  });
});

