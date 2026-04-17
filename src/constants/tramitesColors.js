export const ROLE_LABELS = {
  ESTUDIANTE: 'ESTUDIANTES',
  DIRECTOR: 'DIRECTOR DE PROGRAMA',
  ADMIN: 'ADMINISTRADOR',
};

export const ROLE_COLORS = {
  ESTUDIANTE: {
    header: 'bg-red-600',
    active:  'bg-red-50 text-red-700 ring-1 ring-red-200',
    badge:   'bg-red-100 text-red-700',
  },
  DIRECTOR: {
    header: 'bg-blue-700',
    active:  'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    badge:   'bg-blue-100 text-blue-700',
  },
  ADMIN: {
    header: 'bg-slate-800',
    active:  'bg-slate-100 text-slate-900 ring-1 ring-slate-300',
    badge:   'bg-slate-200 text-slate-800',
  },
};
