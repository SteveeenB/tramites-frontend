export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || data?.message || 'Error inesperado del servidor');
    this.status = status;
    this.data = data;
  }
}

const getToken = () => localStorage.getItem('auth_token');

const authHeaders = (extra = {}) => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const handle401 = () => {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
};

export const apiClient = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: authHeaders(options.headers),
  });

  if (res.status === 401) { handle401(); return; }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
};

export const downloadApiClient = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) { handle401(); return; }
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
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 401) { handle401(); return; }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
};
