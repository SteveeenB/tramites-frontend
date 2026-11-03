import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { UI } from '../../constants/tramitesColors';

/**
 * Cabecera de página: migas (texto), botón "volver" opcional, título (h1),
 * etiqueta junto al título (p. ej. un conteo), descripción y acciones.
 */
const EncabezadoPagina = ({
  migas,
  titulo,
  etiqueta,
  descripcion,
  acciones,
  onVolver,
  textoVolver = 'Volver',
  className = 'mb-6',
}) => (
  <header className={className}>
    {onVolver && (
      <button
        type="button"
        onClick={onVolver}
        className={`mb-3 inline-flex items-center gap-1.5 rounded text-sm font-medium text-gray-600 transition-colors hover:text-primario ${UI.foco}`}
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {textoVolver}
      </button>
    )}
    {migas && <p className={`mb-1 ${UI.etiquetaSeccion}`}>{migas}</p>}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className={UI.titulo}>{titulo}</h1>
          {etiqueta}
        </div>
        {descripcion && <p className="mt-1 text-sm text-gray-600">{descripcion}</p>}
      </div>
      {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  </header>
);

export default EncabezadoPagina;
