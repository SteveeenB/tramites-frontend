import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightStartOnRectangleIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { getMenuByRole, getTopLinksByRole } from '../../config/menuConfig';
import { ROLE_USER_LABELS, UI } from '../../constants/tramitesColors';
import { demo } from '../../config/appConfig';

export const SidebarLink = ({ children, icon: Icon, active = false, onClick, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`flex w-full items-center gap-3 rounded-lg px-3 text-left font-medium transition-colors ${UI.foco} ${
      compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
    } ${active ? UI.itemActivo : UI.itemInactivo}`}
  >
    {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
    <span className="min-w-0 flex-1 leading-snug">{children}</span>
  </button>
);

/**
 * Si los items tienen `group`, agrupa con un header por grupo. Si no, los lista planos.
 */
const MenuItems = ({ menuItems, selectedMenuId, onSeleccion }) => {
  const renderLink = (item, compact) => (
    <SidebarLink
      key={item.id}
      icon={item.icon}
      compact={compact}
      active={selectedMenuId === item.id}
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
      <p className={`px-3 pb-1 pt-2 ${UI.etiquetaSeccion}`}>{g.nombre}</p>
      <div className="space-y-1">{g.items.map((it) => renderLink(it, true))}</div>
    </div>
  ));
};

const DemoButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${UI.foco} ${
      active ? UI.itemActivo : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

/**
 * Sidebar única de la aplicación, con el mismo aspecto que la del Módulo de
 * Matrícula: cabecera roja con logo, bloque "Sesión activa" con el rol,
 * navegación con íconos y "Cerrar sesión" al pie.
 *
 *  - Los ítems salen de `menuConfig.js` según el rol (o de `menuItems` si se pasan).
 *  - `selectedMenuId` marca el ítem activo.
 *  - `onSeleccion` es opcional; por defecto navega a `item.route`.
 *  - `campana` es el nodo de notificaciones que el layout coloca en la cabecera
 *    cuando la sidebar está fija (escritorio).
 */
const AppSidebar = ({
  usuario,
  rol: rolProp,
  menuItems,
  selectedMenuId,
  onSeleccion,
  sidebarOpen = false,
  onClose,
  campana = null,
}) => {
  const navigate = useNavigate();
  const { usuario: usuarioAuth, logout, cambiarRol } = useAuth();
  const botonCerrarRef = useRef(null);

  const rol = rolProp || usuario?.rol || 'ESTUDIANTE';
  const items = menuItems || getMenuByRole(rol);
  const topLinks = getTopLinksByRole(rol);

  // En móvil (drawer): Esc cierra y el foco entra al panel al abrirlo.
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    botonCerrarRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen, onClose]);

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
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm animate-overlay-in md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        id="sidebar"
        aria-label="Menú lateral"
        className={`
          fixed inset-y-0 left-0 z-30 flex w-sidebar shrink-0 flex-col border-r border-gray-200 bg-white
          transition-transform duration-300
          md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:shadow
          ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
        `}
      >
        {/* Cabecera institucional */}
        <div className={`flex items-center gap-3 px-5 py-5 ${UI.cabecera}`}>
          <img src="/LOGO.png" alt="Logo UFPS" className="h-9 w-9 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-red-50">UFPS</p>
            <p className="text-[13px] font-semibold leading-tight">Sistema de Posgrados</p>
            <p className="text-[11px] text-red-50">Trámites</p>
          </div>
          <button
            ref={botonCerrarRef}
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Sesión activa */}
        <div className="flex items-start gap-2 border-b border-gray-200 bg-gray-50 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Sesión activa</p>
            <p className="mt-1 truncate text-sm font-bold text-gray-900">{usuario?.nombre || 'Usuario'}</p>
            {usuario?.programaNombre && (
              <p className="truncate text-xs text-gray-600" title={usuario.programaNombre}>{usuario.programaNombre}</p>
            )}
            <span className={`mt-1.5 ${UI.badgeRol}`}>{ROLE_USER_LABELS[rol] || rol}</span>
          </div>
          {campana}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Navegación */}
          <nav aria-label="Navegación principal" className="space-y-1 px-3 py-4">
            {topLinks.map((link) => (
              <SidebarLink key={link.id} icon={link.icon}>{link.label}</SidebarLink>
            ))}
            <button
              type="button"
              onClick={() => { navigate('/tramites'); if (onClose) onClose(); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${UI.foco} ${UI.grupoAbierto}`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              Trámites
            </button>
            <div className="ml-4 space-y-1 border-l-2 border-primario-claro pl-2">
              <MenuItems
                menuItems={items}
                selectedMenuId={selectedMenuId}
                onSeleccion={handleSeleccion}
              />
            </div>
          </nav>

          {/* Selector de usuario demo */}
          {demo && (
            <div className="border-t border-gray-200 px-3 py-4">
              <p className={`mb-2 px-1 ${UI.etiquetaSeccion}`}>Demo — cambiar usuario</p>
              <div className="flex flex-col gap-1.5">
                {demo.DEMO_OPTIONS.map((opt) => (
                  <DemoButton
                    key={opt.key}
                    active={demo.isDemoOptionActive(opt.key, usuarioAuth)}
                    onClick={() => handleCambiarRol(opt.key)}
                  >
                    {opt.label}
                  </DemoButton>
                ))}
                <p className={`mt-2 px-1 ${UI.etiquetaSeccion}`}>Paz y Salvos</p>
                {demo.DEMO_OPTIONS_PAZ_Y_SALVO.map((opt) => (
                  <DemoButton
                    key={opt.key}
                    active={demo.isDemoOptionActive(opt.key, usuarioAuth)}
                    onClick={() => handleCambiarRol(opt.key)}
                  >
                    {opt.label}
                  </DemoButton>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cerrar sesión */}
        <div className="border-t border-gray-200 px-3 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors ${UI.foco} ${UI.itemHoverSalir}`}
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
