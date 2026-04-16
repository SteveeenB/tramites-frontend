import React from 'react';
import { SendIcon } from './icons';

const Etapa2 = ({ etapa2Disponible }) => (
  <aside
    className={`rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm ${
      etapa2Disponible ? 'opacity-100' : 'opacity-60'
    }`}
  >
    <h3 className="mb-3 text-xl font-bold text-slate-900">Etapa 2: Solicitud de Grado</h3>
    <p className="text-sm leading-6 text-slate-600">
      Disponible una vez aprobada la Terminación de Materias.
    </p>
    {etapa2Disponible ? (
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        <SendIcon />
        Iniciar Solicitud de Grado
      </button>
    ) : (
      <div className="mt-4 inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Bloqueada
      </div>
    )}
  </aside>
);

export default Etapa2;
