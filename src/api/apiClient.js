const BASE_URL = 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || data?.message || 'Error inesperado del servidor');
    this.status = status;
    this.data = data;
  }
}

export const apiClient = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // 204 No Content — respuesta vacía válida
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new ApiError(res.status, data);

  return data;
};
