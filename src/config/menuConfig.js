export const MENU_BY_ROLE = {
  ESTUDIANTE: [
    { id: 'proceso-de-grado', label: 'Proceso de Grado', route: '/proceso-de-grado' },
    { id: 'certificados', label: 'Certificados', route: '/tramites' },
  ],
  DIRECTOR: [
    { id: 'bandeja', label: 'Bandeja de aprobación', route: '/tramites' },
    { id: 'historial', label: 'Historial de decisiones', route: '/tramites' },
  ],
  ADMIN: [
    { id: 'panel', label: 'Panel general', route: '/tramites' },
    { id: 'usuarios', label: 'Gestión de usuarios', route: '/tramites' },
    { id: 'configuracion', label: 'Configuración', route: '/tramites' },
  ],
};

// Usuarios demo precargados en data.sql
// ESTUDIANTE_SIN_CREDITOS: Juan Pérez (86/100) — etapa 1 bloqueada
// ESTUDIANTE_CON_CREDITOS: Laura Gomez (100/100) — etapa 1 habilitada
export const DEMO_USERS = {
  ESTUDIANTE:              { cedula: '1098765432', nombre: 'Juan Perez' },
  ESTUDIANTE_CON_CREDITOS: { cedula: '1098765435', nombre: 'Laura Gomez' },
  DIRECTOR:                { cedula: '1098765433', nombre: 'Maria Director' },
  ADMIN:                   { cedula: '1098765434', nombre: 'Admin User' },
};

export const ALLOWED_ROLES = Object.keys(MENU_BY_ROLE);
export const DEFAULT_ROLE = 'ESTUDIANTE';

// Opciones visibles en el selector demo del sidebar
export const DEMO_OPTIONS = [
  { key: 'ESTUDIANTE',              label: 'Estudiante (86 créditos)' },
  { key: 'ESTUDIANTE_CON_CREDITOS', label: 'Estudiante (100 créditos)' },
  { key: 'DIRECTOR',                label: 'Director de programa' },
  { key: 'ADMIN',                   label: 'Administrador' },
];

export const getMenuByRole = (role) => MENU_BY_ROLE[role] || MENU_BY_ROLE[DEFAULT_ROLE];
