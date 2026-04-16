import { apiClient } from './apiClient';

export const solicitudesApi = {
  getByCedula:        (cedula)         => apiClient(`/solicitudes?cedula=${cedula}`),
  crearTerminacion:   (cedula)         => apiClient(`/solicitudes/terminacion-materias?cedula=${cedula}`, { method: 'POST' }),
  getBandejaDirector: (cedula)         => apiClient(`/solicitudes/bandeja?cedula=${cedula}`),
  aprobar:            (id, cedula)     => apiClient(`/solicitudes/${id}/aprobar?cedula=${cedula}`, { method: 'POST' }),
  rechazar:           (id, cedula)     => apiClient(`/solicitudes/${id}/rechazar?cedula=${cedula}`, { method: 'POST' }),
};
