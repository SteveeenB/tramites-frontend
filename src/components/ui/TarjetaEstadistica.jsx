import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { UI } from '../../constants/tramitesColors';

const TONO_ICONO = {
  advertencia: 'bg-amber-100 text-amber-700',
  exito:       'bg-green-100 text-green-700',
  error:       'bg-red-100 text-red-700',
  info:        'bg-blue-100 text-blue-700',
  neutro:      'bg-gray-100 text-gray-600',
};

/**
 * Tarjeta de conteo (KPI) al estilo de las estadísticas de Matrícula: blanca,
 * con ícono de color, número y descripción. Si recibe `onClick` es un botón.
 */
const TarjetaEstadistica = ({ icono: Icono, valor, unidad, titulo, descripcion, tono = 'neutro', onClick, className = '' }) => {
  const contenido = (
    <>
      {Icono && (
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TONO_ICONO[tono] || TONO_ICONO.neutro}`}>
          <Icono className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-gray-700">{titulo}</span>
        <span className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-gray-900">{valor}</span>
          {unidad && <span className="text-xs font-medium text-gray-500">{unidad}</span>}
        </span>
        {descripcion && <span className="mt-0.5 block text-xs text-gray-500">{descripcion}</span>}
      </span>
      {onClick && <ChevronRightIcon className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-hover:text-primario" aria-hidden="true" />}
    </>
  );

  const base = `group flex w-full items-center gap-4 p-5 animate-fade-in-up ${UI.tarjeta} ${className}`;
  return onClick ? (
    <button type="button" onClick={onClick} className={`${base} transition hover:border-gray-300 hover:shadow-md ${UI.foco}`}>
      {contenido}
    </button>
  ) : (
    <div className={base}>{contenido}</div>
  );
};

export default TarjetaEstadistica;
