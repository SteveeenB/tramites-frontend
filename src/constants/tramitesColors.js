export const ROLE_LABELS = {
  ESTUDIANTE: 'ESTUDIANTES',
  DIRECTOR: 'DIRECTOR DE PROGRAMA',
  ADMIN: 'ADMINISTRADOR',
  DEPENDENCIA: 'DEPENDENCIA',
};

// Color institucional unificado: rojo (#dc2626 / red-600) para todos los roles
const RED_THEME = {
  header: 'bg-red-600',
  active:  'bg-red-50 text-red-700 ring-1 ring-red-200',
  badge:   'bg-red-100 text-red-700',
};

export const ROLE_COLORS = {
  ESTUDIANTE: RED_THEME,
  DIRECTOR: RED_THEME,
  ADMIN: RED_THEME,
  DEPENDENCIA: RED_THEME,
  POSGRADOS: RED_THEME,
};
