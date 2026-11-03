import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppSidebar from '../sidebar/AppSidebar';
import TramitesHeader from '../tramites/TramitesHeader';
import BellNotificaciones from '../notificaciones/BellNotificaciones';
import { UI } from '../../constants/tramitesColors';

const ESCRITORIO = '(min-width: 768px)'; // breakpoint md: la sidebar queda fija

const coincide = () =>
  typeof window === 'undefined' || !window.matchMedia ? true : window.matchMedia(ESCRITORIO).matches;

const useEsEscritorio = () => {
  const [esEscritorio, setEsEscritorio] = useState(coincide);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(ESCRITORIO);
    const onChange = (e) => setEsEscritorio(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return esEscritorio;
};

/**
 * Estructura común de las pantallas con menú, igual al PanelLayout del Módulo
 * de Matrícula: sidebar fija en escritorio, drawer con mini-header en móvil.
 *
 * Es un envoltorio (no una ruta): cada página lo usa con sus props y las
 * rutas no cambian. La campana de notificaciones se monta una sola vez
 * (abre una conexión SSE): en la sidebar en escritorio y en el mini-header
 * en móvil.
 */
const PanelLayout = ({ usuario, rol, menuItems, selectedMenuId, onSeleccion, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const esEscritorio = useEsEscritorio();
  const botonMenuRef = useRef(null);

  const cerrarSidebar = useCallback(() => setSidebarOpen(false), []);

  // Al cerrar el drawer, el foco vuelve al botón que lo abrió.
  const estabaAbierta = useRef(false);
  useEffect(() => {
    if (estabaAbierta.current && !sidebarOpen) botonMenuRef.current?.focus();
    estabaAbierta.current = sidebarOpen;
  }, [sidebarOpen]);

  const campana = (
    <BellNotificaciones variante={esEscritorio ? 'sidebar' : 'barra'} />
  );

  return (
    <div className={`flex min-h-screen ${UI.pagina}`}>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primario focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <AppSidebar
        usuario={usuario}
        rol={rol}
        menuItems={menuItems}
        selectedMenuId={selectedMenuId}
        onSeleccion={onSeleccion}
        sidebarOpen={sidebarOpen}
        onClose={cerrarSidebar}
        campana={esEscritorio ? campana : null}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TramitesHeader
          onMenuToggle={() => setSidebarOpen(true)}
          botonMenuRef={botonMenuRef}
          menuAbierto={sidebarOpen}
          campana={esEscritorio ? null : campana}
        />
        <main id="contenido" tabIndex={-1} className="flex-1 p-4 focus:outline-none sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PanelLayout;
