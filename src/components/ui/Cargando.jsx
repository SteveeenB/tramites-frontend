import React from 'react';

/** Indicador de carga: spinner rojo y texto, como el de Matrícula. */
const Cargando = ({ texto = 'Cargando...', className = '', compacto = false }) => (
  <div
    role="status"
    className={`flex items-center justify-center gap-3 text-gray-500 ${compacto ? 'py-4' : 'flex-col py-16'} ${className}`}
  >
    <svg className={`${compacto ? 'h-5 w-5' : 'h-8 w-8'} animate-spin text-primario`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span className="text-sm font-medium">{texto}</span>
  </div>
);

export default Cargando;
