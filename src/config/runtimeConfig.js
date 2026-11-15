// Valores de compilación: los usan `npm start` y los despliegues estáticos
// que definen REACT_APP_* al construir.
const BUILD_CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
};

// /config.js define window.__APP_CONFIG__. En Docker lo genera
// docker-entrypoint.sh con las variables del contenedor. Fuera de Docker es el
// archivo vacío de public/ y se usan los valores de compilación.
// Un valor vacío del runtime no reemplaza al de compilación.
export const getRuntimeConfig = () => {
  const runtimeConfig = (typeof window !== 'undefined' && window.__APP_CONFIG__) || {};
  return Object.fromEntries(
    Object.entries(BUILD_CONFIG).map(([key, buildValue]) => [key, runtimeConfig[key] || buildValue]),
  );
};

export const getApiBaseUrl = () => getRuntimeConfig().API_URL;
export const getGoogleClientId = () => getRuntimeConfig().GOOGLE_CLIENT_ID;
