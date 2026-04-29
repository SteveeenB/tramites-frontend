export const MENU_BY_ROLE = {
  ESTUDIANTE: [
    { id: 'proceso-de-grado', label: 'Proceso de Grado', route: '/proceso-de-grado' },
    { id: 'certificados', label: 'Certificados', route: '/certificados' },
  ],
  DIRECTOR: [
    { id: 'bandeja', label: 'Bandeja de aprobación', route: '/tramites' },
    { id: 'historial', label: 'Historial de decisiones', route: '/tramites' },
  ],
  ADMIN: [
    { id: 'panel', label: 'Panel general', route: '/tramites' },
    { id: 'usuarios', label: 'Gestión de usuarios', route: '/tramites' },
    { id: 'configuracion', label: 'Configuración', route: '/tramites/admin/configuracion' },
  ],
};

// Usuarios demo (cédulas registradas en Supabase)
// ESTUDIANTE:              Juan Pérez    — 40/56 créditos  → etapa 1 bloqueada
// ESTUDIANTE_CON_CREDITOS: Laura Gómez  — 56/56 créditos  → solicitud APROBADA
// ESTUDIANTE_TIC:          Ana Torres   — 77/77 créditos  → sin solicitud, puede crearla
export const DEMO_USERS = {
  ESTUDIANTE:              { cedula: '1098765432', nombre: 'Juan Perez',    programaAcademico: 'Maestría en Gerencia de Empresas' },
  ESTUDIANTE_CON_CREDITOS: { cedula: '1098765435', nombre: 'Laura Gomez',  programaAcademico: 'Maestría en Gerencia de Empresas' },
  ESTUDIANTE_TIC:          { cedula: '1098765440', nombre: 'Ana Torres',   programaAcademico: 'Maestría en TIC aplicadas a la Educación' },
  DIRECTOR:                { cedula: '1098765433', nombre: 'Maria Director', programaAcademico: 'Maestría en Educación Matemáticas' },
  ADMIN:                   { cedula: '1098765434', nombre: 'Admin User',   programaAcademico: 'Especialización en Estructuras' },
};


//export const ALLOWED_ROLES = Object.keys(MENU_BY_ROLE);
//export const DEFAULT_ROLE = 'ESTUDIANTE';
//No me estaba accediendo a los otros estudiantes asi que le estoy modificando aqui para poder acceder a laura y
export const ALLOWED_ROLES = ['ESTUDIANTE', 'ESTUDIANTE_CON_CREDITOS', 'ESTUDIANTE_TIC', 'DIRECTOR', 'ADMIN'];
export const DEFAULT_ROLE = 'ESTUDIANTE';

// Opciones visibles en el selector demo del sidebar
export const DEMO_OPTIONS = [
  { key: 'ESTUDIANTE',              label: 'Estudiante Juan (40/56 créditos)' },
  { key: 'ESTUDIANTE_CON_CREDITOS', label: 'Estudiante Laura (56/56 – aprobada)' },
  { key: 'ESTUDIANTE_TIC',          label: 'Estudiante Ana (77/77 – sin solicitud)' },
  { key: 'DIRECTOR',                label: 'Director de programa' },
  { key: 'ADMIN',                   label: 'Administrador' },
];

export const getMenuByRole = (role) => MENU_BY_ROLE[role] || MENU_BY_ROLE[DEFAULT_ROLE];
