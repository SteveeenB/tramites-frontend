// Datos del selector de usuarios demo (TP-147). Solo se cargan cuando el
// build tiene REACT_APP_DEMO_MODE=true: AuthContext y AppSidebar lo importan
// con un require condicionado a esa variable, y como CRA la sustituye al
// compilar, en producción este archivo ni siquiera entra en el bundle.
// No importarlo de forma estática desde ningún otro módulo.

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
