import { apiClient, downloadApiClient, uploadApiClient } from "./apiClient";

export const solicitudesApi = {
  getMias: () => apiClient(`/solicitudes`),

  crearTerminacion: () =>
    apiClient(`/solicitudes/terminacion-materias`, { method: "POST" }),

  crearSolicitudGrado: (datos) => {
    const fd = new FormData();
    fd.append("tituloProyecto", datos.tituloProyecto);
    fd.append("resumen", datos.resumen);
    fd.append("tipoProyecto", datos.tipoProyecto);
    fd.append("foto", datos.foto);
    fd.append("actaSustentacion", datos.actaSustentacion);
    if (datos.certificadoIngles)
      fd.append("certificadoIngles", datos.certificadoIngles);
    return uploadApiClient("/solicitudes/grado", fd);
  },

  getBandejaDirector: () => apiClient(`/solicitudes/bandeja`),
  getBandejaGrado:    () => apiClient(`/solicitudes/bandeja-grado`),
  obtenerDetalleGrado: (id) => apiClient(`/solicitudes/grado/${id}`),

  aprobar: (id) =>
    apiClient(`/solicitudes/${id}/aprobar`, { method: "POST" }),

  getDocumentos: (id) => apiClient(`/solicitudes/${id}/documentos`),

  rechazar: (id, motivo = "") =>
    apiClient(
      `/solicitudes/${id}/rechazar${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ""}`,
      { method: "POST" },
    ),

  descargarActa: (id) => downloadApiClient(`/solicitudes/${id}/acta`),

  subirDocumento: (id, file) => {
    const fd = new FormData();
    fd.append("archivo", file);
    return uploadApiClient(`/solicitudes/${id}/documentos`, fd);
  },

  pagarGrado: (id) =>
    apiClient(`/solicitudes/${id}/pagar-grado`, { method: "POST" }),

  elegirFechaGrado: (id, fecha) =>
    apiClient(`/solicitudes/${id}/fecha-grado?fecha=${fecha}`, { method: "POST" }),

  getBandejaPosgrados: () => apiClient(`/solicitudes/posgrados/bandeja`),

  descargarCertificadoPdf: (id) =>
    downloadApiClient(`/solicitudes/${id}/certificado-pdf`),

  aprobarPosgrados: (id) =>
    apiClient(`/solicitudes/${id}/aprobar-posgrados`, { method: "POST" }),

  rechazarPosgrados: (id, motivo = "") =>
    apiClient(
      `/solicitudes/${id}/rechazar-posgrados${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ""}`,
      { method: "POST" },
    ),

  registrarModalidadGrado: (id, modalidad) =>
    apiClient(`/solicitudes/${id}/modalidad-grado?modalidad=${modalidad}`, { method: "POST" }),

  pagarModalidad: (id) =>
    apiClient(`/solicitudes/${id}/pagar-modalidad`, { method: "POST" }),

  verificarCertificado: (codigo) =>
    apiClient(`/solicitudes/verificar?codigo=${encodeURIComponent(codigo)}`),
};
