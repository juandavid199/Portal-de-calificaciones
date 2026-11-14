import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RootLayout from '@/app/layout';

const mockReplace = vi.fn();
const mockCerrarSesion = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue('/'),
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    usuario: { uid: 'user-admin', correo: 'admin@portal.edu.co', rol: 'admin' },
    rol: 'admin',
    cargando: false,
    iniciarSesion: vi.fn(),
    cerrarSesion: mockCerrarSesion,
  }),
}));

describe('RootLayout - Landmarks Semánticos y Navegación Accesible', () => {
  it('renderiza todos los landmarks semánticos obligatorios (WCAG 2.2 AA)', () => {
    render(
      <RootLayout>
        <div>Contenido de prueba</div>
      </RootLayout>
    );

    // 1. Landmark <header> (banner)
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // 2. Landmark <nav> (navigation)
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();

    // 3. Landmark <main> con id="contenido-principal" para el skip link
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'contenido-principal');

    // 4. Landmark <footer> (contentinfo)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('proporciona un enlace accesible "Saltar al contenido" que apunta al main', () => {
    render(
      <RootLayout>
        <div>Contenido</div>
      </RootLayout>
    );

    const skipLink = screen.getByRole('link', { name: /saltar al contenido principal/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#contenido-principal');
  });

  it('contiene los enlaces de navegación a las rutas principales del sistema', async () => {
    const user = userEvent.setup();
    render(
      <RootLayout>
        <div>Contenido</div>
      </RootLayout>
    );

    // Abrir el menú para hacer visibles los enlaces
    const menuButton = screen.getByRole('button', { name: /menú de navegación/i });
    await user.click(menuButton);

    expect(screen.getByRole('link', { name: /mis cursos/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /mis notas/i })).toHaveAttribute('href', '/estudiante/notas');
    expect(screen.getByRole('link', { name: /gestión docente/i })).toHaveAttribute('href', '/docente/cursos/demo-1');
    expect(screen.getByRole('link', { name: /administración de cursos/i })).toHaveAttribute('href', '/admin/cursos');
    expect(screen.getByRole('link', { name: /gestión de usuarios/i })).toHaveAttribute('href', '/admin/usuarios');
  });

  it('permite alternar el menú móvil accesible mediante botón con aria-expanded', async () => {
    const user = userEvent.setup();
    render(
      <RootLayout>
        <div>Contenido</div>
      </RootLayout>
    );

    const menuButton = screen.getByRole('button', { name: /abrir menú de navegación|cerrar menú de navegación/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Clic abre el menú
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Tecla Escape cierra el menú
    await user.keyboard('{Escape}');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('permite cerrar sesión desde el menú y redirige a /login', async () => {
    const user = userEvent.setup();
    render(
      <RootLayout>
        <div>Contenido</div>
      </RootLayout>
    );

    const menuButton = screen.getByRole('button', { name: /abrir menú de navegación|cerrar menú de navegación/i });
    await user.click(menuButton);

    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    await user.click(logoutButton);

    expect(mockCerrarSesion).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
