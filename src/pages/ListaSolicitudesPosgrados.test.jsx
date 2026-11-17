// TP-156: Posgrados puede generar el acta de grado desde su bandeja cuando la
// solicitud de grado está aprobada y el estudiante ya eligió la fecha.
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ListaSolicitudesPosgrados from './ListaSolicitudesPosgrados';
import { solicitudesApi } from '../api/solicitudesApi';

jest.mock('../api/solicitudesApi', () => ({
  solicitudesApi: {
    getBandejaPosgrados: jest.fn(),
    descargarActa: jest.fn(),
    descargarCertificadoPdf: jest.fn(),
    aprobarPosgrados: jest.fn(),
    rechazarPosgrados: jest.fn(),
  },
}));

const grado = (extra) => ({
  id: 13,
  radicado: 'UFPS-2026-GR-00013',
  tipo: 'GRADO',
  estado: 'APROBADA',
  nombreEstudiante: 'Israel Bulla Rey',
  cedulaEstudiante: '1127339958',
  codigoEstudiante: '22070000',
  programa: 'Maestría en TIC aplicadas a la Educación',
  fechaSolicitud: '2026-11-17',
  fechaGrado: '2026-11-18',
  ...extra,
});

const renderEn = (ruta) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/tramites/bandeja-posgrados/:tipo/:estado" element={<ListaSolicitudesPosgrados />} />
      </Routes>
    </MemoryRouter>
  );

describe('ListaSolicitudesPosgrados — acta de grado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:acta');
    global.URL.revokeObjectURL = jest.fn();
    // jsdom no implementa la navegación del <a download>
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  test('una solicitud de grado aprobada con fecha muestra el botón y descarga el acta', async () => {
    solicitudesApi.getBandejaPosgrados.mockResolvedValue({ terminacion: [], grado: [grado()] });
    solicitudesApi.descargarActa.mockResolvedValue({ blob: new Blob(['%PDF']) });

    renderEn('/tramites/bandeja-posgrados/grado/aprobadas');

    const botones = await screen.findAllByRole('button', { name: 'Acta de grado' });
    fireEvent.click(botones[0]);

    await waitFor(() => expect(solicitudesApi.descargarActa).toHaveBeenCalledWith(13));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  test('sin fecha de grado elegida no muestra el botón', async () => {
    solicitudesApi.getBandejaPosgrados.mockResolvedValue({
      terminacion: [],
      grado: [grado({ fechaGrado: null })],
    });

    renderEn('/tramites/bandeja-posgrados/grado/aprobadas');

    await screen.findAllByText('Israel Bulla Rey');
    expect(screen.queryByRole('button', { name: 'Acta de grado' })).not.toBeInTheDocument();
  });

  test('si el backend falla muestra un mensaje claro', async () => {
    solicitudesApi.getBandejaPosgrados.mockResolvedValue({ terminacion: [], grado: [grado()] });
    solicitudesApi.descargarActa.mockRejectedValue(new Error('No se puede generar el acta'));

    renderEn('/tramites/bandeja-posgrados/grado/aprobadas');

    const botones = await screen.findAllByRole('button', { name: 'Acta de grado' });
    fireEvent.click(botones[0]);

    expect(await screen.findByText(/No se pudo generar el acta de grado/)).toBeInTheDocument();
  });
});
