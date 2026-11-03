import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { UI } from '../../constants/tramitesColors';

const ICONO = {
  ESTADO_CAMBIADO: ClipboardDocumentCheckIcon,
  PLAZO_VENCIDO:   ClockIcon,
  GENERAL:         BellIcon,
};

const AUTO_DISMISS_MS = 5000;

const ToastNotificacion = ({ notificacion, onDismiss }) => {
  const navigate = useNavigate();
  const { toastId, tipo, titulo, mensaje, enlace } = notificacion;
  const Icono = ICONO[tipo] || ICONO.GENERAL;

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
      className="flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-lg animate-alert-in"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primario-suave text-primario">
        <Icono className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{titulo}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{mensaje}</p>
        {enlace && (
          <button
            type="button"
            onClick={handleClick}
            className={`mt-1 inline-flex items-center gap-1 rounded text-xs font-medium text-primario hover:underline ${UI.foco}`}
          >
            Ver detalle
            <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toastId)}
        aria-label="Cerrar notificación"
        className={`ml-1 shrink-0 rounded text-gray-500 hover:text-gray-600 ${UI.foco}`}
      >
        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default ToastNotificacion;
