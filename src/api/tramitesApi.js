import { apiClient, BASE_URL } from './apiClient';

export const tramitesApi = {
  getModulo:       () => apiClient('/tramites'),
  getProcesoGrado: () => apiClient('/tramites/proceso-grado'),

  // ── TP-126 Mis Trámites ──────────────────────────────────────────
  getMisTramites: () => apiClient('/tramites/mis'),
  getHistorial:   (id) => apiClient(`/tramites/${id}/historial`),
};

// SSE — fuera del objeto porque EventSource no soporta headers
export const crearSseStream = (onEstadoActualizado, onConectado, onError) => {
  const token = localStorage.getItem('auth_token');
  const url = `${BASE_URL}/tramites/mis/stream?token=${encodeURIComponent(token)}`;

  const es = new EventSource(url);

  es.addEventListener('conectado', () => {
    if (onConectado) onConectado();
  });

  es.addEventListener('estado-actualizado', (e) => {
    try {
      const data = JSON.parse(e.data);
      if (onEstadoActualizado) onEstadoActualizado(data);
    } catch (_) {}
  });

  es.addEventListener('keep-alive', () => {});

  es.onerror = () => {
    if (onError) onError();
  };

  return es;
};