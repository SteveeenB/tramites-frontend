import React from 'react';

/**
 * Header común de cada sección administrativa de Posgrados.
 * Mantiene la jerarquía visual consistente entre todas las pestañas.
 */
const PosgradosHeader = ({ titulo, descripcion, breadcrumb, accion }) => (
  <div className="mb-6">
    {breadcrumb && (
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <span>Administración</span>
        <span>/</span>
        <span className="text-slate-700">{breadcrumb}</span>
      </div>
    )}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{titulo}</h2>
        {descripcion && (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{descripcion}</p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  </div>
);

export default PosgradosHeader;
