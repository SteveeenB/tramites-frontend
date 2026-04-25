import { apiClient } from './apiClient';

export const convocatoriasApi = {
  getActiva: () => apiClient('/convocatorias/activa'),
  actualizar: (cedula, fechaInicio, fechaFin) =>
    apiClient(`/convocatorias?cedula=${cedula}`, {
      method: 'PUT',
      body: JSON.stringify({ fechaInicio, fechaFin }),
    }),
};
