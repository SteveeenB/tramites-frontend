export const MENU_BY_ROLE = {
  DEPENDENCIA: [
    { id: 'paz-y-salvo',  label: 'Paz y Salvos',  route: '/tramites' },
  ],
  ESTUDIANTE: [
    { id: 'proceso-de-grado', label: 'Proceso de Grado', route: '/proceso-de-grado' },
    { id: 'certificados',     label: 'Certificados',     route: '/certificados'      },
  ],
  DIRECTOR: [
    { id: 'bandeja',           label: 'Bandeja de Solicitudes', route: '/tramites/bandeja-solicitudes' },
    { id: 'paz-y-salvo',       label: 'Mis Paz y Salvos',        route: '/tramites'                   },
    { id: 'estado-estudiantes', label: 'Estado Estudiantes',     route: '/tramites'                   },
  ],
  // POSGRADOS = perfil OPERATIVO. Atiende solicitudes, paz y salvos y configura tarifas.
  POSGRADOS: [
    { id: 'bandeja-posgrados', label: 'Trámites de Grado',    route: '/tramites' },
    { id: 'paz-y-salvos',      label: 'Paz y Salvos',         route: '/tramites' },
    { id: 'certificados',      label: 'Certificados Físicos', route: '/tramites' },
    { id: 'tipos-tramite',     label: 'Tarifas de Trámites',  route: '/tramites' },
    { id: 'fechas-grado',      label: 'Fechas de Grado',      route: '/tramites' },
    { id: 'reportes',          label: 'Reportes',             route: '/tramites' },
  ],
  // ADMIN = perfil CONFIGURADOR (es_super_admin en el modelo objetivo).
  // Gestiona catálogos, dependencias y plantillas.
  // FIX TP-193 (Johan Bueno, 07/10/2026): se retira la pestaña Convocatorias.
  ADMIN: [
    { id: 'tipos-tramite',        label: 'Tipos de Trámite',          route: '/tramites' },
    { id: 'tipos-certificado',    label: 'Tipos de Certificado',       route: '/tramites' },
    { id: 'dependencias',         label: 'Dependencias y Paz y Salvos', route: '/tramites' },
    { id: 'plantillas-certificado', label: 'Plantillas de Certificado', route: '/tramites' },
  ],
};

// Enlaces que van sueltos encima de la sección "Trámites" de la sidebar.
// Hoy no tienen ruta propia; viven aquí para que todas las páginas muestren
// la misma sidebar.
export const TOP_LINKS_BY_ROLE = {
  ESTUDIANTE: [
    { id: 'info-estudiantil', label: 'Información Estudiantil' },
    { id: 'info-academica',   label: 'Información Académica'   },
  ],
};

export const getTopLinksByRole = (role) => TOP_LINKS_BY_ROLE[role] || [];

// Usuarios demo (cédulas registradas en Supabase)
export const DEMO_USERS = {
  ESTUDIANTE:              { cedula: '1098765432', nombre: 'Juan Perez',          programaAcademico: 'Maestría en Gerencia de Empresas'          },
  ESTUDIANTE_CON_CREDITOS: { cedula: '1098765435', nombre: 'Laura Gomez',         programaAcademico: 'Maestría en Gerencia de Empresas'          },
  ESTUDIANTE_TIC:          { cedula: '1098765440', nombre: 'Ana Torres',          programaAcademico: 'Maestría en TIC aplicadas a la Educación'  },
  DIRECTOR:                { cedula: '1098765433', nombre: 'Maria Director',      programaAcademico: 'Maestría en Educación Matemáticas'         },
  // Admins viven en la tabla `admins` (refactor plan_roles_v2). El demo
  // endpoint /auth/login-demo busca por código cuando no encuentra cédula.
  POSGRADOS:               { cedula: 'POS001',     nombre: 'Oficina Posgrados',     programaAcademico: null                                        },
  ADMIN:                   { cedula: 'ADMIN1',     nombre: 'Administrador',         programaAcademico: null                                        },
  DEPENDENCIA_BIBLIOTECA:  { cedula: 'DEP001',     nombre: 'Biblioteca Central',    programaAcademico: null                                        },
  DEPENDENCIA_TESORERIA:   { cedula: 'DEP002',     nombre: 'División Financiera',   programaAcademico: null                                        },
  DEPENDENCIA_ADMISIONES:  { cedula: 'DEP003',     nombre: 'Admisiones y Registro', programaAcademico: null                                        },
  ESTUDIANTE_GRADO:        { cedula: '2000000010', nombre: 'Andrea Prueba Grado', programaAcademico: 'Maestría en Gerencia de Empresas'          },
  ESTUDIANTE_KEDARVI:      { cedula: '2000000011', nombre: 'Kevin Estudiante',    programaAcademico: 'Maestría en Gerencia de Empresas'          },
};

export const ALLOWED_ROLES = Object.keys(MENU_BY_ROLE);
export const DEFAULT_ROLE  = 'ESTUDIANTE';

export const DEMO_OPTIONS = [
  { key: 'ESTUDIANTE',              label: 'Estudiante Juan (40/56 créditos)'        },
  { key: 'ESTUDIANTE_CON_CREDITOS', label: 'Estudiante Laura (56/56 – créditos)'    },
  { key: 'ESTUDIANTE_TIC',          label: 'Estudiante Ana (77/77 – créditos)' },
  { key: 'ESTUDIANTE_KEDARVI',      label: 'Estudiante Kevin (56 créditos – certificado)' },
  { key: 'DIRECTOR',                label: 'Director de programa'                    },
  { key: 'POSGRADOS',               label: 'Coordinador de Posgrados (operativo)'    },
  { key: 'ADMIN',                   label: 'Administrador (configurador)'            },
];

export const DEMO_OPTIONS_PAZ_Y_SALVO = [
  { key: 'ESTUDIANTE_GRADO',       label: 'Estudiante Andrea (solicitud de grado)' },
  { key: 'DEPENDENCIA_BIBLIOTECA', label: 'Biblioteca Central (dependencia)'       },
  { key: 'DEPENDENCIA_TESORERIA',  label: 'Tesorería (dependencia)'                },
  { key: 'DEPENDENCIA_ADMISIONES', label: 'Admisiones y Registro (dependencia)'    },
];

export const getMenuByRole = (role) => MENU_BY_ROLE[role] || MENU_BY_ROLE[DEFAULT_ROLE];

// ¿La opción del selector demo corresponde al usuario autenticado?
// Estudiantes y dependencias se distinguen por cédula; el resto por rol.
export const isDemoOptionActive = (key, usuario) => {
  if (!usuario) return false;
  if (key.startsWith('ESTUDIANTE')) {
    if (usuario.rol !== 'ESTUDIANTE') return false;
    if (key !== 'ESTUDIANTE') return DEMO_USERS[key]?.cedula === usuario.cedula;
    // "ESTUDIANTE" (Juan) también cubre a un estudiante real que no sea otro demo.
    return !Object.entries(DEMO_USERS).some(
      ([k, u]) => k.startsWith('ESTUDIANTE_') && u.cedula === usuario.cedula
    );
  }
  if (key.startsWith('DEPENDENCIA_')) return DEMO_USERS[key]?.cedula === usuario.cedula;
  return key === usuario.rol;
};
