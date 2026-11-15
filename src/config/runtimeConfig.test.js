const ENV_ORIGINAL = { ...process.env };

const cargar = () => {
  let modulo;
  jest.isolateModules(() => {
    modulo = require('./runtimeConfig');
  });
  return modulo;
};

afterEach(() => {
  process.env = { ...ENV_ORIGINAL };
  delete window.__APP_CONFIG__;
});

describe('runtimeConfig', () => {
  test('sin config.js ni variables usa el backend local', () => {
    delete process.env.REACT_APP_API_URL;
    delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const { getApiBaseUrl, getGoogleClientId } = cargar();

    expect(getApiBaseUrl()).toBe('http://localhost:8080/api');
    expect(getGoogleClientId()).toBe('');
  });

  test('el config.js vacío de public/ no pisa las variables de compilación', () => {
    process.env.REACT_APP_API_URL = 'https://api.render.example/api';
    process.env.REACT_APP_GOOGLE_CLIENT_ID = 'build-client-id';
    window.__APP_CONFIG__ = {};
    const { getApiBaseUrl, getGoogleClientId } = cargar();

    expect(getApiBaseUrl()).toBe('https://api.render.example/api');
    expect(getGoogleClientId()).toBe('build-client-id');
  });

  test('el config.js del contenedor tiene prioridad y los valores vacíos se ignoran', () => {
    process.env.REACT_APP_API_URL = 'https://api.render.example/api';
    process.env.REACT_APP_GOOGLE_CLIENT_ID = 'build-client-id';
    window.__APP_CONFIG__ = { API_URL: 'https://tramites-api.ufps.edu.co/api', GOOGLE_CLIENT_ID: '' };
    const { getApiBaseUrl, getGoogleClientId } = cargar();

    expect(getApiBaseUrl()).toBe('https://tramites-api.ufps.edu.co/api');
    expect(getGoogleClientId()).toBe('build-client-id');
  });
});
