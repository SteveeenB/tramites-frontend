import React from 'react';
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/tramitesColors';
import BellNotificaciones from '../notificaciones/BellNotificaciones';

const TramitesHeader = ({ usuario, rol, onMenuToggle }) => {
  const colores = ROLE_COLORS[rol] || ROLE_COLORS.ESTUDIANTE;

  return (
    <header
      className={`flex items-center justify-between gap-4 px-6 py-4 text-white shadow-sm md:px-8 ${colores.header}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 lg:hidden"
          aria-label="Abrir menú"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">
          {ROLE_LABELS[rol] || rol}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <BellNotificaciones rol={rol} />

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
