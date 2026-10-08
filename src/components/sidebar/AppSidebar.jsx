import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  DEMO_OPTIONS,
  DEMO_OPTIONS_PAZ_Y_SALVO,
  getMenuByRole,
  getTopLinksByRole,
  isDemoOptionActive,
} from '../../config/menuConfig';
import { ROLE_COLORS, ROLE_USER_LABELS } from '../../constants/tramitesColors';
import { DEMO_MODE } from '../../config/appConfig';

export const SidebarLink = ({ children, active = false, activeClass, onClick, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`w-full rounded-xl px-4 text-left font-medium transition ${
      compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
    } ${active ? activeClass : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
  >
    {children}
  </button>
);

/**
 * Si los items tienen `group`, agrupa con un header por grupo (POSGRADOS tiene
 * muchas pestañas). Si no, los lista planos.
 */
const MenuItems = ({ menuItems, selectedMenuId, onSeleccion, colores }) => {
  const renderLink = (item, compact) => (
    <SidebarLink
      key={item.id}
      compact={compact}
      active={selectedMenuId === item.id}
      activeClass={colores.active}
      onClick={() => onSeleccion(item)}
    >
      {item.label}
    </SidebarLink>
  );

  if (!menuItems.some((it) => it.group)) {
    return <div className="space-y-1">{menuItems.map((it) => renderLink(it, false))}</div>;
  }

  const grupos = [];
  for (const item of menuItems) {
    const nombre = item.group || 'Otros';
    let entry = grupos.find((g) => g.nombre === nombre);
    if (!entry) { entry = { nombre, items: [] }; grupos.push(entry); }
    entry.items.push(item);
  }

  return grupos.map((g) => (
    <div key={g.nombre} className="mb-3 last:mb-0">
      <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {g.nombre}
      </p>
      <div className="space-y-1">{g.items.map((it) => renderLink(it, true))}</div>
    </div>
  ));
};

const DemoButton = ({ active, activeClass, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
      active ? activeClass : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

/**
 * Sidebar única de la aplicación. Todas las páginas con menú lateral la usan,
 * así la estructura (tarjeta de usuario, enlaces superiores, sección "Trámites",
 * cerrar sesión, selector demo) y el estilo salen de un solo lugar.
 *
 *  - Los ítems salen de `menuConfig.js` según el rol (o de `menuItems` si se pasan).
 *  - `selectedMenuId` marca el ítem activo.
 *  - `onSeleccion` es opcional; por defecto navega a `item.route`.
 */
const AppSidebar = ({
  usuario,
  rol: rolProp,
  menuItems,
  selectedMenuId,
  onSeleccion,
  sidebarOpen = false,
  onClose,
}) => {
  const navigate = useNavigate();
  const { usuario: usuarioAuth, logout, cambiarRol } = useAuth();

  const rol = rolProp || usuario?.rol || 'ESTUDIANTE';
  const colores = ROLE_COLORS[rol] || ROLE_COLORS.ESTUDIANTE;
  const items = menuItems || getMenuByRole(rol);
  const topLinks = getTopLinksByRole(rol);

  const handleSeleccion = (item) => {
    if (onSeleccion) onSeleccion(item);
    else if (item.route) navigate(item.route);
    if (onClose) onClose();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleCambiarRol = async (demoKey) => {
    await cambiarRol(demoKey);
    if (!demoKey.startsWith('ESTUDIANTE')) navigate('/tramites');
  };

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
        fixed inset-y-0 left-0 z-30 flex w-72 flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-xl
        transition-transform duration-300
        lg:static lg:z-auto lg:w-80 lg:translate-x-0 lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex-1 px-5 py-6">
          {/* Info usuario */}
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${colores.badge}`}>
              {(usuario?.nombre || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {ROLE_USER_LABELS[rol] || rol}
              </p>
              <p className="truncate font-semibold text-slate-900">{usuario?.nombre || 'Usuario'}</p>
              {usuario?.programaNombre && (
                <p className="mt-0.5 text-xs text-slate-500">{usuario.programaNombre}</p>
              )}
            </div>
          </div>

          {/* Navegación */}
          <nav className="space-y-2">
            {topLinks.map((link) => (
              <SidebarLink key={link.id}>{link.label}</SidebarLink>
            ))}
            <div className="rounded-2xl bg-slate-50 p-3">
              <SidebarLink onClick={() => { navigate('/tramites'); if (onClose) onClose(); }}>
                Trámites
              </SidebarLink>
              <div className="mt-2 pl-3">
                <MenuItems
                  menuItems={items}
                  selectedMenuId={selectedMenuId}
                  onSeleccion={handleSeleccion}
                  colores={colores}
                />
              </div>
            </div>
          </nav>
        </div>

        {/* Cerrar sesión */}
        <div className="border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Selector de usuario demo */}
        {DEMO_MODE && (
          <div className="border-t border-slate-200 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Demo — cambiar usuario
            </p>
            <div className="flex flex-col gap-2">
              {DEMO_OPTIONS.map((opt) => (
                <DemoButton
                  key={opt.key}
                  active={isDemoOptionActive(opt.key, usuarioAuth)}
                  activeClass={colores.active}
                  onClick={() => handleCambiarRol(opt.key)}
                >
                  {opt.label}
                </DemoButton>
              ))}
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Paz y Salvos
              </p>
              {DEMO_OPTIONS_PAZ_Y_SALVO.map((opt) => (
                <DemoButton
                  key={opt.key}
                  active={isDemoOptionActive(opt.key, usuarioAuth)}
                  activeClass={colores.active}
                  onClick={() => handleCambiarRol(opt.key)}
                >
                  {opt.label}
                </DemoButton>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default AppSidebar;
