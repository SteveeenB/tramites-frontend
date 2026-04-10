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

// Usuarios demo precargados en data.sql — uno por cada rol
export const DEMO_USERS = {
  ESTUDIANTE: { cedula: '1098765432', nombre: 'Juan Perez' },
  DIRECTOR:   { cedula: '1098765433', nombre: 'Maria Director' },
  ADMIN:      { cedula: '1098765434', nombre: 'Admin User' },
};

export const ALLOWED_ROLES = Object.keys(MENU_BY_ROLE);
export const DEFAULT_ROLE = 'ESTUDIANTE';

export const getMenuByRole = (role) => MENU_BY_ROLE[role] || MENU_BY_ROLE[DEFAULT_ROLE];
