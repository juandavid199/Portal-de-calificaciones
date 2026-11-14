import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/cursos/route';
import * as authLib from '@/lib/auth';
import * as cursoService from '@/services/cursoService';
import { ForbiddenError } from '@/lib/errores';

vi.mock('@/lib/auth');
vi.mock('@/services/cursoService');

describe('API /api/cursos - Listar y Crear Cursos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/cursos retorna la lista de cursos para el usuario autenticado', async () => {
    vi.spyOn(authLib, 'requerirUsuario').mockResolvedValue({
      uid: 'docente-1',
      correo: 'docente@portal.edu.co',
      rol: 'docente',
    });

    vi.spyOn(cursoService, 'consultarCursosParaUsuario').mockResolvedValue([
      {
        id: 'curso-1',
        nombre: 'Desarrollo Web',
        docenteUid: 'docente-1',
        periodo: '2026-2',
        cerrado: false,
        actividades: [],
        creadoEn: '2026-01-01T00:00:00Z',
      },
    ]);

    const req = new Request('http://localhost:3000/api/cursos', { method: 'GET' });
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.total).toBe(1);
    expect(json.cursos[0].nombre).toBe('Desarrollo Web');
  });

  it('POST /api/cursos permite a un admin crear un curso nuevo en Firestore', async () => {
    vi.spyOn(authLib, 'requerirUsuario').mockResolvedValue({
      uid: 'admin-1',
      correo: 'admin@portal.edu.co',
      rol: 'admin',
    });

    vi.spyOn(cursoService, 'registrarCurso').mockResolvedValue('nuevo-curso-id');

    const req = new Request('http://localhost:3000/api/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Seguridad en la Nube',
        docenteUid: 'docente-1',
        docenteNombre: 'Prof. Carlos',
        periodo: '2026-2',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.id).toBe('nuevo-curso-id');
    expect(json.mensaje).toMatch(/creado exitosamente/i);
  });

  it('POST /api/cursos rechaza si el usuario no tiene rol admin', async () => {
    vi.spyOn(authLib, 'requerirUsuario').mockRejectedValue(
      new ForbiddenError('Se requiere uno de los siguientes roles: admin')
    );

    const req = new Request('http://localhost:3000/api/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Curso Prohibido',
        periodo: '2026-2',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});
