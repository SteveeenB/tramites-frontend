import { apiClient } from './apiClient';

export const tramitesApi = {
  getModulo:      (cedula) => apiClient(`/tramites?cedula=${cedula}`),
  getProcesoGrado:(cedula) => apiClient(`/tramites/proceso-grado?cedula=${cedula}`),
};
