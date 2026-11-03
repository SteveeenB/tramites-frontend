// Etiquetas por rol (texto). El color ya no depende del rol: ver UI más abajo.
export const ROLE_LABELS = {
  ESTUDIANTE: 'ESTUDIANTES',
  DIRECTOR: 'DIRECTOR DE PROGRAMA',
  ADMIN: 'ADMINISTRADOR',
  DEPENDENCIA: 'DEPENDENCIA',
  POSGRADOS: 'POSGRADOS',
};

// Etiqueta del rol en singular (badge de "Sesión activa" en la sidebar)
export const ROLE_USER_LABELS = {
  ESTUDIANTE: 'Estudiante',
  DIRECTOR: 'Director de programa',
  ADMIN: 'Administrador',
  DEPENDENCIA: 'Dependencia',
  POSGRADOS: 'Posgrados',
};

// Clases reutilizables del sistema visual, compartido con el Módulo de Matrícula
// (SC-03). Rojo institucional único para todos los roles. Los valores de color
// viven en tailwind.config.js (primario, fondo y escalas); aquí solo se combinan.
export const UI = {
  pagina:         'bg-fondo text-gray-900',
  cabecera:       'bg-primario text-white',
  itemActivo:     'bg-primario text-white shadow',
  itemInactivo:   'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  grupoAbierto:   'bg-primario-suave text-primario',
  itemHoverSalir: 'hover:bg-primario-suave hover:text-primario',
  badgeRol:       'inline-block rounded bg-primario px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white',
  tarjeta:        'rounded-lg border border-gray-200 bg-white shadow',
  etiquetaSeccion:'text-xs font-semibold uppercase tracking-wider text-gray-600',
  titulo:         'text-xl font-bold text-gray-900',
  foco:           'focus:outline-none focus-visible:ring-2 focus-visible:ring-primario-borde focus-visible:ring-offset-1',
  campo:          'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition hover:border-gray-300 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-primario-borde disabled:cursor-not-allowed disabled:bg-gray-50',
};

// Tonos de estado. Los mapas de estado (EstadoBadge, procesodeGrado, Certificados,
// etc.) apuntan aquí en lugar de repetir colores sueltos.
export const TONOS = {
  exito:       'bg-green-100 text-green-700',
  advertencia: 'bg-amber-100 text-amber-800',
  error:       'bg-red-100 text-red-700',
  info:        'bg-blue-100 text-blue-700',
  neutro:      'bg-slate-100 text-slate-600',
};

// Solo para HTML que se abre en otra ventana sin Tailwind (recibo impreso).
export const COLORES_IMPRESION = {
  primario: '#c10007',
  texto: '#101828',
  textoSuave: '#4a5565',
  borde: '#e5e7eb',
  fondo: '#f9fafb',
};
