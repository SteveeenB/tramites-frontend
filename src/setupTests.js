// Configuración global de Jest (Create React App la carga antes de cada prueba).
// TP-195: el frontend no tenía pruebas; este archivo habilita los matchers de
// Testing Library (toBeInTheDocument, toHaveClass, ...).
import '@testing-library/jest-dom';

// react-router-dom 7 usa TextEncoder/TextDecoder, que el jsdom de Jest 27
// (react-scripts 5) no expone como globales.
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
