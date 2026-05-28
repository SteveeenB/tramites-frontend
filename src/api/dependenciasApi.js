import { apiClient } from './apiClient';

export const dependenciasApi = {
  // Catálogo
  listarCatalogo: ()          => apiClient('/dependencias/catalogo'),
  crear:          (body)      => apiClient('/dependencias/catalogo',       { method: 'POST',  body: JSON.stringify(body) }),
  actualizar:     (id, body)  => apiClient(`/dependencias/catalogo/${id}`, { method: 'PUT',   body: JSON.stringify(body) }),
  toggleActivo:   (id, valor) => apiClient(`/dependencias/catalogo/${id}/activo?valor=${valor}`, { method: 'PATCH' }),

  // Responsables (usuarios con rol DEPENDENCIA)
  listarUsuarios:  ()       => apiClient('/dependencias/usuarios-dependencia'),
  crearUsuario:    (body)   => apiClient('/dependencias/usuarios-dependencia',           { method: 'POST',   body: JSON.stringify(body) }),
  eliminarUsuario: (cedula) => apiClient(`/dependencias/usuarios-dependencia/${cedula}`, { method: 'DELETE' }),
};
