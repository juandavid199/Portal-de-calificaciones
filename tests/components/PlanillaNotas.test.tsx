import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { PlanillaNotas } from '@/components/planilla/PlanillaNotas';

describe('<PlanillaNotas /> - Accesibilidad y Navegación por Teclado', () => {
  const mockDatos = {
    curso: 'Matemáticas Especiales',
    actividades: [
      { id: 'a1', nombre: 'Actividad 1', porcentaje: 50 },
      { id: 'a2', nombre: 'Actividad 2', porcentaje: 50 },
    ],
    estudiantes: [
      { uid: 'e1', nombre: 'Ana Pérez', notas: { a1: 4.0, a2: 3.0 } },
      { uid: 'e2', nombre: 'Carlos Ruiz', notas: { a1: 3.5, a2: 4.5 } },
    ],
  };

  it('renderiza una tabla semántica con encabezados y roles accesibles', () => {
    render(<PlanillaNotas datos={mockDatos} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').length).toBe(4); // Estudiante, Act 1, Act 2, Definitivo
    expect(screen.getAllByRole('row').length).toBe(3); // 1 encabezado + 2 filas
  });

  it('permite navegar entre celdas usando las flechas del teclado', async () => {
    const user = userEvent.setup();
    render(<PlanillaNotas datos={mockDatos} />);

    const inputE1A1 = screen.getByLabelText(/Ana Pérez - Actividad 1/i);
    const inputE1A2 = screen.getByLabelText(/Ana Pérez - Actividad 2/i);
    const inputE2A1 = screen.getByLabelText(/Carlos Ruiz - Actividad 1/i);
    const inputE2A2 = screen.getByLabelText(/Carlos Ruiz - Actividad 2/i);

    // 1. Enfocar celda (0, 0)
    await user.click(inputE1A1);
    expect(inputE1A1).toHaveFocus();

    // 2. ArrowRight -> Enfoca celda (0, 1)
    await user.keyboard('{ArrowRight}');
    expect(inputE1A2).toHaveFocus();

    // 3. ArrowDown -> Enfoca celda (1, 1)
    await user.keyboard('{ArrowDown}');
    expect(inputE2A2).toHaveFocus();

    // 4. ArrowLeft -> Enfoca celda (1, 0)
    await user.keyboard('{ArrowLeft}');
    expect(inputE2A1).toHaveFocus();

    // 5. ArrowUp -> Regresa a celda (0, 0)
    await user.keyboard('{ArrowUp}');
    expect(inputE1A1).toHaveFocus();
  });

  it('recalcula el definitivo reactivamente al cambiar una nota', async () => {
    const user = userEvent.setup();
    render(<PlanillaNotas datos={mockDatos} />);

    // Definitivo inicial de Ana: 4.0*0.5 + 3.0*0.5 = 3.5
    const celdaDefinitivo = screen.getByLabelText(/Definitivo Ana Pérez/i);
    expect(celdaDefinitivo).toHaveTextContent('3.5');

    // Cambiar nota de Actividad 1 de 4.0 a 5.0 (nuevo: 5.0*0.5 + 3.0*0.5 = 4.0)
    const inputE1A1 = screen.getByLabelText(/Ana Pérez - Actividad 1/i);
    await user.clear(inputE1A1);
    await user.type(inputE1A1, '5.0');

    expect(celdaDefinitivo).toHaveTextContent('4.0');
  });

  it('rechaza notas fuera de rango y muestra mensaje de error accesible', async () => {
    const user = userEvent.setup();
    render(<PlanillaNotas datos={mockDatos} />);

    const inputE1A1 = screen.getByLabelText(/Ana Pérez - Actividad 1/i);
    await user.clear(inputE1A1);
    await user.type(inputE1A1, '5.5'); // Inválido (> 5.0)

    expect(screen.getByRole('alert')).toHaveTextContent(/nota máxima es 5.0/i);
  });
});

