import { apiClient } from './apiClient';

export const tramitesApi = {
  getModulo:       () => apiClient('/tramites'),
  getProcesoGrado: () => apiClient('/tramites/proceso-grado'),
};
