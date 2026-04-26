import { apiClient } from './apiClient';

export const tramitesApi = {
  getModulo:       (cedula) => apiClient(cedula ? `/tramites?cedula=${cedula}` : '/tramites'),
  getProcesoGrado: (cedula) => apiClient(cedula ? `/tramites/proceso-grado?cedula=${cedula}` : '/tramites/proceso-grado'),
};
