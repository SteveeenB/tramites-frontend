import { apiClient, downloadApiClient, uploadApiClient } from './apiClient';

export const solicitudesApi = {
  getMias:             (cedula)              => apiClient(`/solicitudes?cedula=${cedula}`),
  crearTerminacion:    (cedula)              => apiClient(`/solicitudes/terminacion-materias?cedula=${cedula}`, { method: 'POST' }),
  crearSolicitudGrado: (cedula, datos) => {
    const fd = new FormData();
    fd.append('cedula', cedula);
    fd.append('tituloProyecto', datos.tituloProyecto);
    fd.append('resumen', datos.resumen);
    fd.append('tipoProyecto', datos.tipoProyecto);
    fd.append('foto', datos.foto);
    fd.append('actaSustentacion', datos.actaSustentacion);
    if (datos.certificadoIngles) fd.append('certificadoIngles', datos.certificadoIngles);
    return uploadApiClient('/solicitudes/grado', fd);
  },
  getBandejaDirector:  (cedula)              => apiClient(`/solicitudes/bandeja?cedula=${cedula}`),
  getBandejaGrado:    (cedula)          => apiClient(`/solicitudes/bandeja-grado?cedula=${cedula}`),
  obtenerDetalleGrado: (id)             => apiClient(`/solicitudes/grado/${id}`),
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
