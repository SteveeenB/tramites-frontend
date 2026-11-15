export const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

// CRA resuelve esta condición al compilar y excluye los datos demo en producción.
export const demo = process.env.REACT_APP_DEMO_MODE === 'true' ? require('./demoUsers') : null;
