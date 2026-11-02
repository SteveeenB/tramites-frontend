// TP-195: el badge traduce el estado técnico de la solicitud a un texto
// entendible por el usuario (lineamiento de UI: mensajes en español y sin
// jerga técnica). TP-198 separó el rechazo de Posgrados del del Director.
import React from 'react';
import { render, screen } from '@testing-library/react';
import EstadoBadge from './EstadoBadge';

describe('EstadoBadge', () => {
  test.each([
    ['PENDIENTE_PAGO', 'Pago pendiente'],
    ['EN_REVISION', 'En revisión'],
    ['APROBADA_DIRECTOR', 'Aprobada por director'],
    ['APROBADA', 'Aprobada'],
    ['RECHAZADA', 'Rechazada'],
    ['RECHAZADA_POSGRADOS', 'Rechazada por Posgrados'],
    ['APROBADA_POSGRADOS', 'Aprobada por Posgrados'],
  ])('el estado %s se muestra como "%s"', (estado, etiqueta) => {
    render(<EstadoBadge estado={estado} />);

    expect(screen.getByText(etiqueta)).toBeInTheDocument();
  });

  test('los rechazos se muestran en rojo', () => {
    render(<EstadoBadge estado="RECHAZADA_POSGRADOS" />);

    expect(screen.getByText('Rechazada por Posgrados')).toHaveClass('bg-red-100');
  });

  test('un estado desconocido se muestra tal cual con estilo neutro', () => {
    render(<EstadoBadge estado="ESTADO_NUEVO" />);

    const badge = screen.getByText('ESTADO_NUEVO');
    expect(badge).toHaveClass('bg-slate-100');
  });
});
