import { apiClient } from './apiClient';

export const convocatoriasApi = {
  getActiva:  ()                         => apiClient('/convocatorias/activa'),
  actualizar: (fechaInicio, fechaFin)    => apiClient('/convocatorias', {
    method: 'PUT',
    body: JSON.stringify({ fechaInicio, fechaFin }),
  }),
};
