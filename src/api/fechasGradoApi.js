import { apiClient } from './apiClient';

export const fechasGradoApi = {
  /** Estudiante: solo las activas y no vencidas. */
  disponibles: () => apiClient('/fechas-grado/disponibles'),
  /** Posgrados: todas, incluidas inactivas y vencidas. */
  listar: () => apiClient('/fechas-grado'),
  crear: (campos) => apiClient('/fechas-grado', { method: 'POST', body: JSON.stringify(campos) }),
  actualizar: (id, campos) => apiClient(`/fechas-grado/${id}`, { method: 'PATCH', body: JSON.stringify(campos) }),
  eliminar: (id) => apiClient(`/fechas-grado/${id}`, { method: 'DELETE' }),
};
