import React from 'react';
import { DEMO_OPTIONS } from '../../config/menuConfig';
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/tramitesColors';

const TramitesSidebar = ({ usuario, rol, menuItems, selectedMenuId, onSeleccion, cambiarRol }) => {
  const colores = ROLE_COLORS[rol] || ROLE_COLORS.ESTUDIANTE;

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex-1 px-5 py-6">
        {/* Info usuario */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${colores.badge}`}>
            {(usuario?.nombre || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {ROLE_LABELS[rol] || rol}
            </p>
            <p className="font-semibold text-slate-900">{usuario?.nombre || 'Usuario'}</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="space-y-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <button
              type="button"
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold ${colores.active}`}
            >
              Trámites
            </button>
            <div className="mt-2 space-y-1 pl-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSeleccion(item)}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
                    selectedMenuId === item.id
                      ? colores.active
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Selector de rol demo */}
      <div className="border-t border-slate-200 p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
          Demo — cambiar usuario
        </p>
        <div className="flex flex-col gap-2">
          {DEMO_OPTIONS.map((opt) => {
            const esActivo =
              opt.key === rol ||
              (opt.key === 'ESTUDIANTE_CON_CREDITOS' &&
                rol === 'ESTUDIANTE' &&
                usuario?.cedula === '1098765435');
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => cambiarRol(opt.key)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  esActivo ? colores.active : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default TramitesSidebar;
