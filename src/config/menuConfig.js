export const MENU_BY_ROLE = {
  DEPENDENCIA: [
    { id: 'paz-y-salvo',  label: 'Paz y Salvos',  route: '/tramites' },
    { id: 'certificados', label: 'Certificados',  route: '/tramites' },
  ],
  ESTUDIANTE: [
    { id: 'proceso-de-grado', label: 'Proceso de Grado', route: '/proceso-de-grado' },
    { id: 'certificados',     label: 'Certificados',     route: '/certificados'      },
  ],
  DIRECTOR: [
    { id: 'bandeja',           label: 'Bandeja de Solicitudes', route: '/tramites/bandeja-solicitudes' },
    { id: 'historial',         label: 'Historial de Decisiones', route: '/tramites'                   },
    { id: 'paz-y-salvo',       label: 'Mis Paz y Salvos',        route: '/tramites'                   },
    { id: 'estado-estudiantes', label: 'Estado Estudiantes',     route: '/tramites'                   },
  ],
  // POSGRADOS = perfil OPERATIVO. Solo atiende solicitudes y consulta métricas.
  // No configura el catálogo del módulo (eso lo hace ADMIN).
  POSGRADOS: [
    { id: 'bandeja-posgrados', label: 'Bandeja de Solicitudes', route: '/tramites' },
    { id: 'reportes',          label: 'Reportes',               route: '/tramites' },
  ],
  // ADMIN = perfil CONFIGURADOR (es_super_admin en el modelo objetivo).
  // Gestiona catálogos, dependencias, plantillas, convocatorias y configuración global.
  ADMIN: [
    // ── Operación ─────────────────────────────────────────────────
    { id: 'reportes', label: 'Reportes', route: '/tramites', group: 'Operación' },

    // ── Catálogos ─────────────────────────────────────────────────
    { id: 'tipos-certificado',     label: 'Tipos de Certificado', route: '/tramites', group: 'Catálogos' },
    { id: 'tipos-tramite',         label: 'Tipos de Trámite',     route: '/tramites', group: 'Catálogos' },
    { id: 'dependencias',          label: 'Dependencias y Paz y Salvos', route: '/tramites', group: 'Catálogos' },
    { id: 'documentos-requeridos', label: 'Documentos Requeridos', route: '/tramites', group: 'Catálogos' },

    // ── Personas ─────────────────────────────────────────────────
    { id: 'usuarios',  label: 'Usuarios',             route: '/tramites', group: 'Personas' },
    { id: 'programas', label: 'Programas Académicos', route: '/tramites', group: 'Personas' },

    // ── Comunicación ─────────────────────────────────────────────
    { id: 'convocatorias',           label: 'Convocatorias',              route: '/tramites', group: 'Comunicación' },
    { id: 'plantillas-correo',       label: 'Plantillas de Correo',       route: '/tramites', group: 'Comunicación' },
    { id: 'plantillas-certificado',  label: 'Plantillas de Certificado',  route: '/tramites', group: 'Comunicación' },

    // ── Sistema ──────────────────────────────────────────────────
    { id: 'auditoria',            label: 'Auditoría',            route: '/tramites', group: 'Sistema' },
    { id: 'configuracion-global', label: 'Configuración Global', route: '/tramites', group: 'Sistema' },
  ],
};

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
