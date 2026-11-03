import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Boton, Tarjeta } from '../ui';

const TarjetaAccion = ({ icono, titulo, descripcion, etiqueta, onClick, deshabilitada = false }) => (
  <Tarjeta
    className={`flex flex-col justify-between animate-fade-in-up transition ${
      deshabilitada ? 'opacity-60' : 'hover:border-gray-300 hover:shadow-md'
    }`}
  >
    <div>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primario-suave text-primario">
        {icono}
      </div>
      <h2 className="mb-1.5 text-base font-semibold text-gray-900">{titulo}</h2>
      <p className="text-sm leading-6 text-gray-600">{descripcion}</p>
    </div>
    <Boton
      className="mt-5 self-start"
      onClick={onClick}
      disabled={deshabilitada}
      iconoDerecha={ChevronRightIcon}
      variante={deshabilitada ? 'secundario' : 'primario'}
    >
      {etiqueta}
    </Boton>
  </Tarjeta>
);

export default TarjetaAccion;
