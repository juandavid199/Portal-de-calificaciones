import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaginaLogin from '@/app/login/page';
import * as authContext from '@/context/AuthContext';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue('/'),
  }),
}));

vi.mock('@/context/AuthContext');

describe('Flujo de Autenticación - Formulario de Login', () => {
  const mockIniciarSesion = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      usuario: null,
      rol: null,
      cargando: false,
      iniciarSesion: mockIniciarSesion,
      cerrarSesion: vi.fn(),
    });
  });

  it('renderiza un formulario semántico y accesible con campos de correo y contraseña', () => {
    render(<PaginaLogin />);

    expect(screen.getByRole('heading', { level: 1, name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar al portal/i })).toBeInTheDocument();
  });

  it('valida que los campos sean obligatorios antes de enviar', async () => {
    const user = userEvent.setup();
    render(<PaginaLogin />);

    const boton = screen.getByRole('button', { name: /ingresar al portal/i });
    await user.click(boton);

    expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
  });

  it('envía las credenciales y maneja el flujo exitoso de inicio de sesión', async () => {
    const user = userEvent.setup();
    mockIniciarSesion.mockResolvedValueOnce(undefined);

    render(<PaginaLogin />);

    const inputEmail = screen.getByLabelText(/correo electrónico/i);
    const inputPassword = screen.getByLabelText(/contraseña/i);
    const boton = screen.getByRole('button', { name: /ingresar al portal/i });

    await user.type(inputEmail, 'docente@portal.edu.co');
    await user.type(inputPassword, 'PasswordSeguro123!');
    await user.click(boton);

    await waitFor(() => {
      expect(mockIniciarSesion).toHaveBeenCalledWith('docente@portal.edu.co', 'PasswordSeguro123!');
    });
  });

  it('muestra un mensaje de error accesible si la autenticación falla', async () => {
    const user = userEvent.setup();
    mockIniciarSesion.mockRejectedValueOnce(new Error('Credenciales inválidas o usuario no registrado.'));

    render(<PaginaLogin />);

    await user.type(screen.getByLabelText(/correo electrónico/i), 'error@portal.edu.co');
    await user.type(screen.getByLabelText(/contraseña/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /ingresar al portal/i }));

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(/credenciales inválidas/i);
  });
});
