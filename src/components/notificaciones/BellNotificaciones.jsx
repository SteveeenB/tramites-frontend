import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  BellIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { UI } from '../../constants/tramitesColors';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import ToastNotificacion from './ToastNotificacion';

const ICONO_TIPO = {
  ESTADO_CAMBIADO: ClipboardDocumentCheckIcon,
  PLAZO_VENCIDO:   ClockIcon,
  GENERAL:         BellIcon,
};

// La campana va en el bloque "Sesión activa" de la sidebar (escritorio) o en
// el mini-header (móvil). Solo cambia hacia dónde se abre el panel.
const VARIANTES = {
  sidebar: { panel: 'left-0' },
  barra:   { panel: 'right-0' },
};

const formatFecha = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const BellNotificaciones = ({ variante = 'barra' }) => {
  const v = VARIANTES[variante] || VARIANTES.barra;
  const { notificaciones, noLeidas, toasts, marcar, dismissToast } = useNotificaciones();
  const [abierto, setAbierto] = useState(false);
  const panelRef = useRef(null);
  const botonRef = useRef(null);
  const navigate = useNavigate();

  // Cierra el panel al hacer clic fuera
  useEffect(() => {
    if (!abierto) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        botonRef.current && !botonRef.current.contains(e.target)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [abierto]);

  const handleClickNoti = (noti) => {
    if (!noti.leida) marcar(noti.id);
    if (noti.enlace) {
      setAbierto(false);
      navigate(noti.enlace);
    }
  };

  const badgeClass = `absolute -top-1.5 -right-1.5 flex h-4 min-w-[1rem] items-center
    justify-center rounded-full bg-primario px-1 text-[10px] font-bold leading-none text-white`;

  return (
    <>
      {/* ── Campana ── */}
      <div className="relative">
        <button
          ref={botonRef}
          type="button"
          onClick={() => setAbierto((abiertoAntes) => !abiertoAntes)}
          aria-label="Notificaciones"
          aria-expanded={abierto}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600
                     transition-colors hover:bg-gray-200/70 hover:text-gray-900 focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-primario-borde"
        >
          <BellIcon className="h-5 w-5" aria-hidden="true" />

          {noLeidas > 0 && (
            <span className={badgeClass} aria-label={`${noLeidas} notificaciones sin leer`}>
              {noLeidas > 99 ? '99+' : noLeidas}
            </span>
          )}
        </button>

        {/* ── Panel desplegable ── */}
        {abierto && (
          <div
            ref={panelRef}
            className={`absolute top-11 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg
                        border border-gray-200 bg-white text-gray-900 shadow-lg animate-dropdown-in ${v.panel}`}
            role="dialog"
            aria-label="Panel de notificaciones"
          >
            {/* Cabecera del panel */}
            <div className={`flex items-center justify-between px-4 py-2.5 ${UI.cabecera}`}>
              <span className="text-sm font-semibold text-white">Notificaciones</span>
              {noLeidas > 0 && (
                <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold text-white">
                  {noLeidas} sin leer
                </span>
              )}
            </div>

            {/* Lista */}
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notificaciones.length === 0 ? (
                <li className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                  <BellIcon className="h-10 w-10 text-gray-300" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-600">Sin notificaciones</p>
                  <p className="text-xs text-gray-500">
                    Aquí aparecerán las actualizaciones de tus trámites.
                  </p>
                </li>
              ) : (
                notificaciones.map((n) => {
                  const Icono = ICONO_TIPO[n.tipo] || ICONO_TIPO.GENERAL;
                  return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClickNoti(n)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50
                                  ${n.leida ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icono className="mt-0.5 h-4 w-4 shrink-0 text-primario" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {n.titulo}
                            </p>
                            {!n.leida && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primario"
                                    aria-label="No leída" />
                            )}
                          </div>
                          <p className="line-clamp-2 text-xs text-gray-600 mt-0.5">{n.mensaje}</p>
                          <p className="mt-1 text-[10px] text-gray-500">{formatFecha(n.fechaCreacion)}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                  );
                })
              )}
            </ul>

            {/* Pie */}
            {notificaciones.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2 text-center">
                <p className="text-xs text-gray-500">
                  {notificaciones.filter((n) => !n.leida).length === 0
                    ? 'Todo al día'
                    : 'Haz clic en cada notificación para marcarla como leída'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Toasts (montados fuera del flujo via portal) ── */}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
          {toasts.map((t) => (
            <ToastNotificacion key={t.toastId} notificacion={t} onDismiss={dismissToast} />
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default BellNotificaciones;
