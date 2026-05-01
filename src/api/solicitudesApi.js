import { apiClient, downloadApiClient, uploadApiClient } from './apiClient';

export const solicitudesApi = {
  getMias:             (cedula)              => apiClient(`/solicitudes?cedula=${cedula}`),
  crearTerminacion:    (cedula)              => apiClient(`/solicitudes/terminacion-materias?cedula=${cedula}`, { method: 'POST' }),
  crearSolicitudGrado: (cedula)              => apiClient(`/solicitudes/grado?cedula=${cedula}`, { method: 'POST' }),
  getBandejaDirector:  (cedula)              => apiClient(`/solicitudes/bandeja?cedula=${cedula}`),
  getBandejaGrado:     (cedula)              => apiClient(`/solicitudes/bandeja-grado?cedula=${cedula}`),
  getDocumentos:       (id, cedula)          => apiClient(`/solicitudes/${id}/documentos?cedula=${cedula}`),
  aprobar:             (id, cedula)          => apiClient(`/solicitudes/${id}/aprobar?cedula=${cedula}`, { method: 'POST' }),
  rechazar: (id, cedula, motivo = '') => {
    const params = new URLSearchParams({ cedula });
    if (motivo) params.set('motivo', motivo);
    return apiClient(`/solicitudes/${id}/rechazar?${params}`, { method: 'POST' });
  },
  descargarActa:       (id)                 => downloadApiClient(`/solicitudes/${id}/acta`),
  subirDocumento:      (id, file)           => {
    const fd = new FormData();
    fd.append('archivo', file);
    return uploadApiClient(`/solicitudes/${id}/documentos`, fd);
  },
};
