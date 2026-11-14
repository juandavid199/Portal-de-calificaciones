import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BotonVolver } from '@/components/common/BotonVolver';

describe('<BotonVolver /> - Componente de Retroceso Accesible (WCAG 2.2 AA)', () => {
  it('renderiza un enlace semántico con href correcto y texto visible', () => {
    render(<BotonVolver href="/" texto="Volver a Mis Cursos" />);

    const link = screen.getByRole('link', { name: /volver a mis cursos/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('cumple con el tamaño mínimo de objetivo táctil accesible (>= 44px)', () => {
    render(<BotonVolver href="/docente/cursos/demo-1" texto="Volver a la Planilla" />);

    const link = screen.getByRole('link', { name: /volver a la planilla/i });
    expect(link).toHaveStyle({ minHeight: '2.75rem' });
  });
});

