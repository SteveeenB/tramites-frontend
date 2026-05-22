import { apiClient } from './apiClient';

export const getMisSolicitudesPazYSalvo = () =>
  apiClient(`/paz-y-salvo/mis-solicitudes`);

export const getPendientesPazYSalvo = () =>
  apiClient(`/paz-y-salvo/pendientes`);

export const responderPazYSalvo = (id, decision, observaciones) => {
  const params = new URLSearchParams({ decision });
  if (observaciones) params.append('observaciones', observaciones);
  return apiClient(`/paz-y-salvo/${id}/responder?${params}`, { method: 'POST' });
};

export const getEstadoPazYSalvos = (solicitudId) =>
  apiClient(`/paz-y-salvo/solicitud/${solicitudId}`);

export const getEstadoEstudiantes = () =>
  apiClient(`/paz-y-salvo/estado-estudiantes`);
