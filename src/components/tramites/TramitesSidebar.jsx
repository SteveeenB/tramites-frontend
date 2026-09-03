import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_OPTIONS, DEMO_OPTIONS_PAZ_Y_SALVO, DEMO_USERS } from '../../config/menuConfig';
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/tramitesColors';

import { DEMO_MODE } from '../../config/appConfig';

/**
 * Renderiza los items del menú lateral. Si los items tienen `group`,
 * agrupa visualmente con un header por grupo. Si no, los lista plano.
 * Esto permite que roles con muchas pestañas (POSGRADOS) tengan secciones
 * claras sin romper el patrón de roles con pocas (ESTUDIANTE, DIRECTOR).
 */
const renderMenuItems = (menuItems, selectedMenuId, onSeleccion, colores) => {
  const tieneGrupos = menuItems.some((it) => it.group);
  if (!tieneGrupos) {
    return menuItems.map((item) => (
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
    ));
  }

  // Agrupar conservando el orden de aparición
  const grupos = [];
  for (const item of menuItems) {
    const g = item.group || 'Otros';
    let entry = grupos.find((x) => x.nombre === g);
    if (!entry) { entry = { nombre: g, items: [] }; grupos.push(entry); }
    entry.items.push(item);
  }

  return grupos.map((g) => (
    <div key={g.nombre} className="mb-3 last:mb-0">
      <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {g.nombre}
      </p>
      <div className="space-y-1">
        {g.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSeleccion(item)}
            className={`w-full rounded-xl px-4 py-2 text-left text-xs font-medium transition ${
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
  ));
};

const TramitesSidebar = ({ usuario, rol, menuItems, selectedMenuId, onSeleccion, cambiarRol, sidebarOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const colores = ROLE_COLORS[rol] || ROLE_COLORS.ESTUDIANTE;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    <aside className={`
      fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl
      transition-transform duration-300 overflow-y-auto
      lg:static lg:z-auto lg:w-80 lg:translate-x-0 lg:shadow-none
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
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
              {renderMenuItems(menuItems, selectedMenuId, onSeleccion, colores)}
            </div>
          </div>
        </nav>
      </div>

      {/* Cerrar sesión */}
      <div className="border-t border-slate-200 px-5 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Selector de rol demo */}
      {DEMO_MODE && (
        <div className="border-t border-slate-200 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Demo — cambiar usuario
          </p>
          <div className="flex flex-col gap-2">
            {DEMO_OPTIONS.map((opt) => {
              const esTIC = rol === 'ESTUDIANTE' && usuario?.cedula === '1098765440';
              const esConCreditos = rol === 'ESTUDIANTE' && usuario?.cedula === '1098765435';
              const esActivo =
                (opt.key === 'ESTUDIANTE_TIC'          && esTIC) ||
                (opt.key === 'ESTUDIANTE_CON_CREDITOS' && esConCreditos) ||
                (opt.key === 'ESTUDIANTE'              && rol === 'ESTUDIANTE' && !esConCreditos && !esTIC) ||
                (opt.key !== 'ESTUDIANTE' && opt.key !== 'ESTUDIANTE_CON_CREDITOS' && opt.key !== 'ESTUDIANTE_TIC' && opt.key === rol);
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
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Paz y Salvos
            </p>
            {DEMO_OPTIONS_PAZ_Y_SALVO.map((opt) => {
              const esActivo = usuario?.cedula === DEMO_USERS[opt.key]?.cedula;
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
      )}
    </aside>
    </>
  );
};

export default TramitesSidebar;
