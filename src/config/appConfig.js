export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

// Selector de usuarios demo (TP-147). La condición va escrita con
// process.env directamente (no con DEMO_MODE) para que CRA la resuelva al
// compilar y, con REACT_APP_DEMO_MODE distinto de 'true', webpack descarte el
// require: así las cédulas y códigos demo no llegan al bundle de producción.
export const demo = process.env.REACT_APP_DEMO_MODE === 'true' ? require('./demoUsers') : null;
