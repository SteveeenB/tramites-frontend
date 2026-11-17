// TP-156: las instrucciones de pago ("Realiza el pago…") solo se muestran
// mientras la solicitud está en PENDIENTE_PAGO.
import React from 'react';
import { render, screen } from '@testing-library/react';
import TarjetaLiquidacion from './TarjetaLiquidacion';

const INSTRUCCIONES = 'Realiza el pago en la ventanilla de Tesorería o por PSE antes de la fecha límite.';

const solicitudCon = (estado) => ({
  id: 1,
  tipo: 'TERMINACION_MATERIAS',
  estado,
  fechaSolicitud: '2026-11-17',
  liquidacion: {
    concepto: 'Terminación de materias',
    valor: 150000,
    fechaLimite: '2026-11-24',
    instrucciones: INSTRUCCIONES,
  },
});

describe('TarjetaLiquidacion', () => {
  test('con PENDIENTE_PAGO muestra las instrucciones y el botón de pago', () => {
    render(<TarjetaLiquidacion solicitud={solicitudCon('PENDIENTE_PAGO')} />);

    expect(screen.getByText(INSTRUCCIONES)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar al pago/i })).toBeInTheDocument();
  });

  test.each(['EN_REVISION', 'APROBADA_DIRECTOR', 'APROBADA', 'RECHAZADA'])(
    'con %s no muestra las instrucciones ni el botón de pago',
    (estado) => {
      render(<TarjetaLiquidacion solicitud={solicitudCon(estado)} />);

      expect(screen.queryByText(INSTRUCCIONES)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /continuar al pago/i })).not.toBeInTheDocument();
    }
  );
});
