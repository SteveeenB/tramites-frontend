import React from 'react';
import { TONOS } from '../../constants/tramitesColors';

/**
 * Etiqueta de estado. `tono` toma un color de TONOS (exito, advertencia, error,
 * info, neutro); `className` permite un color propio cuando el estado lo pide.
 */
const Badge = ({ tono = 'neutro', className, children, ...props }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${className || TONOS[tono] || TONOS.neutro}`}
    {...props}
  >
    {children}
  </span>
);

export default Badge;
