const DEFAULT_CONFIG = {
  API_URL: 'http://localhost:8080/api',
  GOOGLE_CLIENT_ID: '',
};

export const getRuntimeConfig = () => {
  const runtimeConfig = typeof window !== 'undefined' && window.__APP_CONFIG__ ? window.__APP_CONFIG__ : {};
  return {
    ...DEFAULT_CONFIG,
    ...runtimeConfig,
  };
};

export const getApiBaseUrl = () => getRuntimeConfig().API_URL || DEFAULT_CONFIG.API_URL;
export const getGoogleClientId = () => getRuntimeConfig().GOOGLE_CLIENT_ID || DEFAULT_CONFIG.GOOGLE_CLIENT_ID;
