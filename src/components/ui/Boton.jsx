import React from 'react';
import { UI } from '../../constants/tramitesColors';

// Variantes de botón del sistema visual compartido con el Módulo de Matrícula.
export const VARIANTES_BOTON = {
  primario:   'bg-primario text-white shadow-sm hover:bg-primario-hover disabled:bg-red-400',
  secundario: 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 disabled:text-gray-400',
  peligro:    'border border-red-200 bg-white text-primario hover:bg-primario-suave disabled:text-red-300',
  exito:      'bg-green-700 text-white shadow-sm hover:bg-green-800 disabled:bg-green-400',
  oscuro:     'bg-gray-800 text-white shadow-sm hover:bg-gray-900 disabled:bg-gray-400',
  fantasma:   'text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400',
};

export const TAMANOS_BOTON = {
  sm: 'gap-1.5 px-3 py-1.5 text-xs',
  md: 'gap-2 px-4 py-2.5 text-sm',
  lg: 'gap-2 px-6 py-3 text-sm',
};

/** Clases de botón, para los casos en que el elemento no es un <button> (p. ej. un <a>). */
export const clasesBoton = ({ variante = 'primario', tamano = 'md', anchoCompleto = false, className = '' } = {}) =>
  [
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors',
    'disabled:cursor-not-allowed',
    UI.foco,
    VARIANTES_BOTON[variante] || VARIANTES_BOTON.primario,
    TAMANOS_BOTON[tamano] || TAMANOS_BOTON.md,
    anchoCompleto ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

const Boton = ({
  variante = 'primario',
  tamano = 'md',
  anchoCompleto = false,
  icono: Icono,
  iconoDerecha: IconoDerecha,
  cargando = false,
  type = 'button',
  className = '',
  children,
  disabled,
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || cargando}
    aria-busy={cargando || undefined}
    className={clasesBoton({ variante, tamano, anchoCompleto, className })}
    {...props}
  >
    {cargando ? (
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    ) : (
      Icono && <Icono className="h-4 w-4 shrink-0" aria-hidden="true" />
    )}
    {children}
    {IconoDerecha && <IconoDerecha className="h-4 w-4 shrink-0" aria-hidden="true" />}
  </button>
);

export default Boton;
