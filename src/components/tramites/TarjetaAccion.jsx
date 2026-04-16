import React from 'react';
import { ArrowRightIcon } from './icons';

const TarjetaAccion = ({ icono, titulo, descripcion, etiqueta, onClick, deshabilitada = false }) => (
  <div
    className={`flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition ${
      deshabilitada ? 'opacity-60' : 'hover:shadow-md'
    }`}
  >
    <div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        {icono}
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-900">{titulo}</h3>
      <p className="text-sm leading-6 text-slate-600">{descripcion}</p>
    </div>
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitada}
      className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        deshabilitada
          ? 'cursor-not-allowed bg-slate-100 text-slate-400'
          : 'bg-red-600 text-white hover:bg-red-700'
      }`}
    >
      {etiqueta} <ArrowRightIcon />
    </button>
  </div>
);

export default TarjetaAccion;
