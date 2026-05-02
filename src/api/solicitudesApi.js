import { apiClient, downloadApiClient, uploadApiClient } from './apiClient';

export const solicitudesApi = {
  getMias:             (cedula)              => apiClient(`/solicitudes?cedula=${cedula}`),
  crearTerminacion:    (cedula)              => apiClient(`/solicitudes/terminacion-materias?cedula=${cedula}`, { method: 'POST' }),
  crearSolicitudGrado: (cedula)              => apiClient(`/solicitudes/grado?cedula=${cedula}`, { method: 'POST' }),
  getBandejaDirector:  (cedula)              => apiClient(`/solicitudes/bandeja?cedula=${cedula}`),
  getBandejaGrado:    (cedula)         => apiClient(`/solicitudes/bandeja-grado?cedula=${cedula}`),
  aprobar:             (id, cedula)          => apiClient(`/solicitudes/${id}/aprobar?cedula=${cedula}`, { method: 'POST' }),
  getDocumentos:      (id, cedula)     => apiClient(`/solicitudes/${id}/documentos?cedula=${cedula}`),

  rechazar:            (id, cedula, motivo='') => apiClient(
    `/solicitudes/${id}/rechazar?cedula=${cedula}${motivo ? `&motivo=${encodeURIComponent(motivo)}` : ''}`,
    { method: 'POST' }
  ),
  descargarActa:       (id)                 => downloadApiClient(`/solicitudes/${id}/acta`),
  subirDocumento:      (id, file)           => {
    const fd = new FormData();
    fd.append('archivo', file);
    return uploadApiClient(`/solicitudes/${id}/documentos`, fd);
  },
};
