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
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new ApiError(res.status, data);

  return data;
};

// Para descargas de archivos (blob)
export const downloadApiClient = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
  return res.blob();
};

// Para subida de archivos (FormData — sin Content-Type fijo)
export const uploadApiClient = async (path, formData) => {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', body: formData });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
};
