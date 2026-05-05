import { apiClient } from './apiClient';

export const getMisSolicitudesPazYSalvo = (cedula) =>
  apiClient(`/paz-y-salvo/mis-solicitudes?cedula=${cedula}`);

export const getPendientesPazYSalvo = (cedula) =>
  apiClient(`/paz-y-salvo/pendientes?cedula=${cedula}`);

export const responderPazYSalvo = (id, cedula, decision, observaciones) => {
  const params = new URLSearchParams({ cedula, decision });
  if (observaciones) params.append('observaciones', observaciones);
  return apiClient(`/paz-y-salvo/${id}/responder?${params}`, { method: 'POST' });
};

export const getEstadoPazYSalvos = (solicitudId) =>
  apiClient(`/paz-y-salvo/solicitud/${solicitudId}`);

export const getEstadoEstudiantes = (cedula) =>
  apiClient(`/paz-y-salvo/estado-estudiantes?cedula=${cedula}`);
