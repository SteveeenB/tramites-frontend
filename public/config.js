// Fuera de Docker queda vacío: la app usa REACT_APP_API_URL y REACT_APP_GOOGLE_CLIENT_ID.
// En el contenedor, nginx sirve en su lugar el /config.js que genera docker-entrypoint.sh.
window.__APP_CONFIG__ = {};
