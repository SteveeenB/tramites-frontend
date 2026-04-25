import { apiClient } from './apiClient';

export const solicitudesApi = {
  getMias:             ()              => apiClient('/solicitudes'),
  crearTerminacion:    ()              => apiClient('/solicitudes/terminacion-materias', { method: 'POST' }),
  crearSolicitudGrado: ()              => apiClient('/solicitudes/grado', { method: 'POST' }),
  getBandejaDirector:  ()              => apiClient('/solicitudes/bandeja'),
  aprobar:             (id)            => apiClient(`/solicitudes/${id}/aprobar`, { method: 'POST' }),
  rechazar:            (id, motivo='') => apiClient(
    `/solicitudes/${id}/rechazar${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ''}`,
    { method: 'POST' }
  ),
};
