import { apiClient, BASE_URL } from './apiClient';

export const getNotificaciones = () =>
  apiClient('/notificaciones/mias');

export const getConteoNoLeidas = () =>
  apiClient('/notificaciones/no-leidas/count');

export const marcarLeida = (id) =>
  apiClient(`/notificaciones/${id}/leer`, { method: 'PUT' });

// FIX TP-186 (Santiago Cepeda, 07/10/2026): el endpoint SSE ya no acepta la
// cédula por query — ahora exige autenticación y toma el identificador del
// JWT. EventSource no envía headers, así que mandamos el token como query
// param "token" y el JwtAuthFilter del backend lo acepta solo para rutas
// SSE.
/** Abre un EventSource SSE para el usuario autenticado. */
export const crearEventSource = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  return new EventSource(
    `${BASE_URL}/notificaciones/subscribe?token=${encodeURIComponent(token)}`
  );
};
