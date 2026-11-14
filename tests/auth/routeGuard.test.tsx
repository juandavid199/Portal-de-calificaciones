import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteGuard } from '@/components/auth/RouteGuard';
import * as authContext from '@/context/AuthContext';
import * as navigation from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('@/context/AuthContext');

describe('RouteGuard - Bloqueo estricto de vistas sin sesión', () => {
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(navigation.useRouter).mockReturnValue({
      replace: mockReplace,
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it('NO renderiza vistas protegidas si el usuario NO ha iniciado sesión y redirige a /login', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/');
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      usuario: null,
      rol: null,
      cargando: false,
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
    });

    render(
      <RouteGuard>
        <div data-testid="contenido-secreto">Contenido Protegido</div>
      </RouteGuard>
    );

    // No debe renderizarse el contenido protegido
    expect(screen.queryByTestId('contenido-secreto')).not.toBeInTheDocument();
    // Debe mostrar advertencia de redirección
    expect(screen.getByRole('alert')).toHaveTextContent(/debe iniciar sesión/i);
    // Debe invocar router.replace('/login')
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('renderiza la vista normalmente si el usuario TIENE sesión activa', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/');
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      usuario: { uid: 'prof-1', correo: 'docente@portal.edu.co', rol: 'docente' },
      rol: 'docente',
      cargando: false,
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
    });

    render(
      <RouteGuard>
        <div data-testid="contenido-secreto">Contenido Protegido</div>
      </RouteGuard>
    );

    expect(screen.getByTestId('contenido-secreto')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('permite renderizar la ruta pública /login sin tener sesión', () => {
    vi.mocked(navigation.usePathname).mockReturnValue('/login');
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      usuario: null,
      rol: null,
      cargando: false,
      iniciarSesion: vi.fn(),
      cerrarSesion: vi.fn(),
    });

    render(
      <RouteGuard>
        <form data-testid="formulario-login">Formulario de acceso</form>
      </RouteGuard>
    );

    expect(screen.getByTestId('formulario-login')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
