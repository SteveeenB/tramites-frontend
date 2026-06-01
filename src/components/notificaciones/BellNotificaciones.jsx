import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ROLE_COLORS } from '../../constants/tramitesColors';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import ToastNotificacion from './ToastNotificacion';

const ICONO_TIPO = {
  ESTADO_CAMBIADO: '📋',
  PLAZO_VENCIDO:   '⏰',
  GENERAL:         '🔔',
};

const formatFecha = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const BellNotificaciones = ({ rol }) => {
  const colores = ROLE_COLORS[rol] || ROLE_COLORS.ESTUDIANTE;
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

  // Badge color: texto blanco sobre fondo del rol
  const badgeClass = `absolute -top-1.5 -right-1.5 flex h-4 min-w-[1rem] items-center
    justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white
    ${colores.header}`;

  return (
    <>
      {/* ── Campana ── */}
      <div className="relative">
        <button
          ref={botonRef}
          onClick={() => setAbierto((v) => !v)}
          aria-label="Notificaciones"
          aria-expanded={abierto}
          className="relative flex h-9 w-9 items-center justify-center rounded-full
                     bg-white/20 text-white transition hover:bg-white/30 focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-white"
        >
          {/* Bell SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="currentColor" className="h-5 w-5" aria-hidden>
            <path d="M12 2a7 7 0 0 0-7 7v3.586l-1.707 1.707A1 1 0 0 0 4 16h16a1 1 0
                     0 0 .707-1.707L19 12.586V9a7 7 0 0 0-7-7zm0 18a2 2 0 0 1-2-2h4a2
                     2 0 0 1-2 2z"/>
          </svg>

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
            className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-200
                       bg-white shadow-xl"
            role="dialog"
            aria-label="Panel de notificaciones"
          >
            {/* Cabecera del panel */}
            <div className={`flex items-center justify-between rounded-t-xl px-4 py-2.5 ${colores.header}`}>
              <span className="text-sm font-semibold text-white">Notificaciones</span>
              {noLeidas > 0 && (
                <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold text-white">
                  {noLeidas} sin leer
                </span>
              )}
            </div>

            {/* Lista */}
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notificaciones.length === 0 ? (
                <li className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="1.5"
                       className="h-10 w-10 text-slate-300" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
                             6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388
                             6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0
                             11-6 0v-1m6 0H9"/>
                  </svg>
                  <p className="text-sm font-medium text-slate-500">Sin notificaciones</p>
                  <p className="text-xs text-slate-400">
                    Aquí aparecerán las actualizaciones de tus trámites.
                  </p>
                </li>
              ) : (
                notificaciones.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClickNoti(n)}
                      className={`w-full px-4 py-3 text-left transition hover:bg-slate-50
                                  ${n.leida ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-base leading-none" aria-hidden>
                          {ICONO_TIPO[n.tipo] || ICONO_TIPO.GENERAL}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {n.titulo}
                            </p>
                            {!n.leida && (
                              <span className={`shrink-0 h-2 w-2 rounded-full ${colores.header}`}
                                    aria-label="No leída" />
                            )}
                          </div>
                          <p className="line-clamp-2 text-xs text-slate-500 mt-0.5">{n.mensaje}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{formatFecha(n.fechaCreacion)}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>

            {/* Pie */}
            {notificaciones.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2 text-center">
                <p className="text-xs text-slate-400">
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
