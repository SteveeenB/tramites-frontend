import React from 'react';
import { UI } from '../../constants/tramitesColors';

export const CLASE_CAMPO = UI.campo;

/**
 * Etiqueta + control + ayuda/error. El control (input, select o textarea) va
 * como hijo y debe usar `id` y la clase CLASE_CAMPO.
 */
const Campo = ({ id, etiqueta, requerido = false, ayuda, error, className = '', children }) => (
  <div className={className}>
    {etiqueta && (
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-700">
        {etiqueta}
        {requerido && <span className="ml-0.5 text-primario" aria-hidden="true">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p id={id ? `${id}-error` : undefined} className="mt-1 text-xs font-medium text-red-700">{error}</p>
    ) : (
      ayuda && <p id={id ? `${id}-ayuda` : undefined} className="mt-1 text-xs text-gray-500">{ayuda}</p>
    )}
  </div>
);

export default Campo;
