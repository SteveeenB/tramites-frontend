import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UI } from '../../constants/tramitesColors';

const TAMANOS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };
const ENFOCABLES = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Ventana modal accesible con el aspecto de Matrícula: fondo oscuro difuminado,
 * panel blanco rounded-lg. Cierra con Esc o clic fuera (si hay `onCerrar`),
 * mantiene el foco dentro y lo devuelve al cerrar.
 */
const Modal = ({ abierto = true, onCerrar, titulo, tamano = 'md', pie, children, cerrarAlClicFuera = true, className = '' }) => {
  const panelRef = useRef(null);
  const tituloId = useRef(`modal-${Math.random().toString(36).slice(2, 9)}`).current;

  useEffect(() => {
    if (!abierto) return undefined;
    const previo = document.activeElement;
    const panel = panelRef.current;
    (panel?.querySelector(ENFOCABLES) || panel)?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape' && onCerrar) { e.stopPropagation(); onCerrar(); }
      if (e.key !== 'Tab' || !panel) return;
      const nodos = [...panel.querySelectorAll(ENFOCABLES)];
      if (nodos.length === 0) return;
      const primero = nodos[0];
      const ultimo = nodos[nodos.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previo && typeof previo.focus === 'function') previo.focus();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-overlay-in"
        onClick={cerrarAlClicFuera && onCerrar ? onCerrar : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo ? tituloId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[90vh] w-full ${TAMANOS[tamano] || TAMANOS.md} flex-col rounded-lg border border-gray-200 bg-white shadow-xl animate-modal-in focus:outline-none ${className}`}
      >
        {(titulo || onCerrar) && (
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
            {titulo && <h2 id={tituloId} className="text-base font-semibold text-gray-900">{titulo}</h2>}
            {onCerrar && (
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                className={`-mr-2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 ${UI.foco}`}
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {pie && <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 px-6 py-4">{pie}</div>}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
