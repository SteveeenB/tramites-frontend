import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { UI } from '../../constants/tramitesColors';

/**
 * Mini-header de móvil, igual al del Módulo de Matrícula: en escritorio no hay
 * header, todo vive en la sidebar fija. Aquí van el botón del menú, el logo,
 * el título del sistema y la campana (que el layout pasa solo en móvil).
 */
const TramitesHeader = ({ onMenuToggle, botonMenuRef, menuAbierto = false, campana = null }) => (
  <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow md:hidden">
    <button
      ref={botonMenuRef}
      type="button"
      onClick={onMenuToggle}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 ${UI.foco}`}
      aria-label="Abrir menú"
      aria-controls="sidebar"
      aria-expanded={menuAbierto}
    >
      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
    </button>
    <img src="/LOGO.png" alt="" className="h-7 w-7 rounded-sm" />
    <p className="min-w-0 flex-1 truncate text-sm font-bold text-gray-800">Sistema de Posgrados</p>
    {campana}
  </header>
);

export default TramitesHeader;
