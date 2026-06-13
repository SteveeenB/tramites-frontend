import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ICONO = {
  ESTADO_CAMBIADO: '📋',
  PLAZO_VENCIDO:   '⏰',
  GENERAL:         '🔔',
};

const AUTO_DISMISS_MS = 5000;

const ToastNotificacion = ({ notificacion, onDismiss }) => {
  const navigate = useNavigate();
  const { toastId, tipo, titulo, mensaje, enlace } = notificacion;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toastId), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toastId, onDismiss]);

  const handleClick = () => {
    onDismiss(toastId);
    if (enlace) navigate(enlace);
  };

  return (
    <div
      role="alert"
      className="flex w-80 items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
    >
      <span className="mt-0.5 text-lg leading-none" aria-hidden>
        {ICONO[tipo] || ICONO.GENERAL}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{titulo}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{mensaje}</p>
        {enlace && (
          <button
            onClick={handleClick}
            className="mt-1 text-xs font-medium text-red-600 hover:underline"
          >
            Ver detalle →
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toastId)}
        aria-label="Cerrar notificación"
        className="ml-1 shrink-0 text-slate-400 hover:text-slate-600"
      >
        ✕
      </button>
    </div>
  );
};

export default ToastNotificacion;
