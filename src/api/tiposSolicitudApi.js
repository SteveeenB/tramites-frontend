import { apiClient } from './apiClient';

export const tiposSolicitudApi = {
  getAll: () => apiClient('/admin/tipos-solicitud'),
  actualizar: (id, campos) => apiClient(`/admin/tipos-solicitud/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(campos),
  }),
};
