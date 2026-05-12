import React from 'react';

const Spinner = () => (
  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BotonActaTerminacion = ({ onGenerar, disabled = false, cargando = false }) => {
  const inactivo = disabled || cargando;
  return (
    <button
      type="button"
      onClick={onGenerar}
      disabled={inactivo}
      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition
        bg-green-700 hover:bg-green-800
        ${inactivo ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {cargando ? <Spinner /> : <DownloadIcon />}
      {cargando ? 'Descargando…' : 'Descargar Acta de Terminación'}
    </button>
  );
};

export default BotonActaTerminacion;
