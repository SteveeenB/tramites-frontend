// TP-156: descarga del acta de grado desde la vista del estudiante.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DescargarActaGrado from './DescargarActaGrado';
import { solicitudesApi } from '../../api/solicitudesApi';

jest.mock('../../api/solicitudesApi', () => ({
  solicitudesApi: { descargarActaEstudiante: jest.fn() },
}));

describe('DescargarActaGrado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:acta');
    global.URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  test('descarga el acta cuando Posgrados ya la generó', async () => {
    solicitudesApi.descargarActaEstudiante.mockResolvedValue({ blob: new Blob(['%PDF']) });

    render(<DescargarActaGrado solicitudId={13} radicado="UFPS-2026-GR-00013" />);
    fireEvent.click(screen.getByRole('button', { name: /descargar acta de grado/i }));

    await waitFor(() => expect(solicitudesApi.descargarActaEstudiante).toHaveBeenCalledWith(13));
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('si Posgrados aún no la genera muestra el motivo del backend', async () => {
    solicitudesApi.descargarActaEstudiante.mockRejectedValue(
      new Error('Tu acta de grado aún no ha sido generada por la Oficina de Posgrados')
    );

    render(<DescargarActaGrado solicitudId={13} />);
    fireEvent.click(screen.getByRole('button', { name: /descargar acta de grado/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('aún no ha sido generada por la Oficina de Posgrados');
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
  });
});
