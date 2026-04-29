const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || data?.message || 'Error inesperado del servidor');
    this.status = status;
    this.data = data;
  }
}

export const apiClient = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  // 204 No Content — respuesta vacía válida
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new ApiError(res.status, data);

  return data;
};

export const downloadApiClient = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, { credentials: 'include' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
  return {
    blob: await res.blob(),
    contentDisposition: res.headers.get('Content-Disposition'),
  };
};

export const uploadApiClient = async (path, formData) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    method: 'POST',
    body: formData,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
};
