import React from 'react';
import TarjetaSolicitud from './TarjetaSolicitud';

const SeccionSolicitudes = ({ titulo, solicitudes, icono, colores, mensajeVacio }) => (
  <section>
    {/* Cabecera de sección */}
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colores.iconWrapper}`}>
        {icono}
      </div>
      <h3 className={`text-lg font-bold ${colores.titulo}`}>{titulo}</h3>
      <span
        className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold ${colores.badge}`}
      >
        {solicitudes.length}
      </span>
    </div>

    {/* Contenido */}
    {solicitudes.length === 0 ? (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-400">
        {mensajeVacio}
      </p>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {solicitudes.map((s) => (
          <TarjetaSolicitud key={s.id} solicitud={s} colores={colores} />
        ))}
      </div>
    )}
  </section>
);

export default SeccionSolicitudes;
