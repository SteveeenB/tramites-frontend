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

export const ALLOWED_ROLES = Object.keys(MENU_BY_ROLE);
export const DEFAULT_ROLE  = 'ESTUDIANTE';

export const getMenuByRole = (role) => MENU_BY_ROLE[role] || MENU_BY_ROLE[DEFAULT_ROLE];
