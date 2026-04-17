import React from 'react';
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/tramitesColors';

const TramitesHeader = ({ usuario, rol }) => {
  const colores = ROLE_COLORS[rol] || ROLE_COLORS.ESTUDIANTE;

  return (
    <header
      className={`flex items-center justify-between gap-4 px-6 py-4 text-white shadow-sm md:px-8 ${colores.header}`}
    >
      <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">
        {ROLE_LABELS[rol] || rol}
      </h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            {(usuario?.nombre || 'U').slice(0, 2).toUpperCase()}
          </div>
          <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
        </div>
      </div>
    </header>
  );
};

export default TramitesHeader;
