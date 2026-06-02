import { apiClient, BASE_URL } from './apiClient';

export const getNotificaciones = () =>
  apiClient('/notificaciones/mias');

export const getConteoNoLeidas = () =>
  apiClient('/notificaciones/no-leidas/count');

export const marcarLeida = (id) =>
  apiClient(`/notificaciones/${id}/leer`, { method: 'PUT' });

/**
 * Abre un EventSource SSE para el usuario.
 * @param {string} identificador - cedula (ESTUDIANTE/DIRECTOR) o codigo (ADMIN/DEPENDENCIA/POSGRADOS)
 */
export const crearEventSource = (identificador) =>
  new EventSource(`${BASE_URL}/notificaciones/subscribe?cedula=${encodeURIComponent(identificador)}`);
