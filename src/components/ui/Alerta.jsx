import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { UI } from '../../constants/tramitesColors';

const TIPOS = {
  error:       { caja: 'border-red-200 bg-red-50 text-red-800',       icono: XCircleIcon,             colorIcono: 'text-red-600' },
  exito:       { caja: 'border-green-200 bg-green-50 text-green-800', icono: CheckCircleIcon,         colorIcono: 'text-green-600' },
  advertencia: { caja: 'border-amber-200 bg-amber-50 text-amber-800', icono: ExclamationTriangleIcon, colorIcono: 'text-amber-600' },
  info:        { caja: 'border-blue-200 bg-blue-50 text-blue-800',    icono: InformationCircleIcon,   colorIcono: 'text-blue-600' },
};

/** Mensaje en línea (error, éxito, advertencia o información), con los colores de Matrícula. */
const Alerta = ({ tipo = 'error', titulo, children, onCerrar, className = '' }) => {
  const t = TIPOS[tipo] || TIPOS.error;
  const Icono = t.icono;
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${t.caja} ${className}`}
    >
      <Icono className={`mt-0.5 h-5 w-5 shrink-0 ${t.colorIcono}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        <div className={titulo ? 'mt-0.5' : 'font-medium'}>{children}</div>
      </div>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar mensaje"
          className={`shrink-0 rounded opacity-70 hover:opacity-100 ${UI.foco}`}
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Alerta;
