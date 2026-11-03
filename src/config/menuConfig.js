import {
  AcademicCapIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  InboxIcon,
  InboxStackIcon,
  NewspaperIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

// `icon` es solo presentación: el ícono que la sidebar muestra junto al ítem
// (mismo set que el Módulo de Matrícula, Heroicons 24/outline).
export const MENU_BY_ROLE = {
  DEPENDENCIA: [
    { id: 'paz-y-salvo',  label: 'Paz y Salvos',  route: '/tramites', icon: ShieldCheckIcon },
  ],
  ESTUDIANTE: [
    { id: 'proceso-de-grado', label: 'Proceso de Grado', route: '/proceso-de-grado', icon: AcademicCapIcon },
    { id: 'certificados',     label: 'Certificados',     route: '/certificados',      icon: DocumentTextIcon },
  ],
  DIRECTOR: [
    { id: 'bandeja',           label: 'Bandeja de Solicitudes', route: '/tramites/bandeja-solicitudes', icon: InboxIcon },
    { id: 'paz-y-salvo',       label: 'Mis Paz y Salvos',        route: '/tramites', icon: ShieldCheckIcon },
    { id: 'estado-estudiantes', label: 'Estado Estudiantes',     route: '/tramites', icon: UsersIcon },
  ],
  // POSGRADOS = perfil OPERATIVO. Atiende solicitudes, paz y salvos y configura tarifas.
  POSGRADOS: [
    { id: 'bandeja-posgrados', label: 'Trámites de Grado',    route: '/tramites', icon: InboxStackIcon },
    { id: 'paz-y-salvos',      label: 'Paz y Salvos',         route: '/tramites', icon: ShieldCheckIcon },
    { id: 'certificados',      label: 'Certificados Físicos', route: '/tramites', icon: DocumentTextIcon },
    { id: 'tipos-tramite',     label: 'Tarifas de Trámites',  route: '/tramites', icon: CurrencyDollarIcon },
    { id: 'fechas-grado',      label: 'Fechas de Grado',      route: '/tramites', icon: CalendarDaysIcon },
    { id: 'reportes',          label: 'Reportes',             route: '/tramites', icon: ChartBarIcon },
  ],
  // ADMIN = perfil CONFIGURADOR (es_super_admin en el modelo objetivo).
  // Gestiona catálogos, dependencias y plantillas.
  // FIX TP-193 (Johan Bueno, 07/10/2026): se retira la pestaña Convocatorias.
  ADMIN: [
    { id: 'tipos-tramite',        label: 'Tipos de Trámite',          route: '/tramites', icon: RectangleStackIcon },
    { id: 'tipos-certificado',    label: 'Tipos de Certificado',       route: '/tramites', icon: DocumentDuplicateIcon },
    { id: 'dependencias',         label: 'Dependencias y Paz y Salvos', route: '/tramites', icon: BuildingOfficeIcon },
    { id: 'plantillas-certificado', label: 'Plantillas de Certificado', route: '/tramites', icon: NewspaperIcon },
  ],
};

// Enlaces que van sueltos encima de la sección "Trámites" de la sidebar.
// Hoy no tienen ruta propia; viven aquí para que todas las páginas muestren
// la misma sidebar.
export const TOP_LINKS_BY_ROLE = {
  ESTUDIANTE: [
    { id: 'info-estudiantil', label: 'Información Estudiantil', icon: UserCircleIcon },
    { id: 'info-academica',   label: 'Información Académica',   icon: BookOpenIcon },
  ],
};

export const getTopLinksByRole = (role) => TOP_LINKS_BY_ROLE[role] || [];

export const ALLOWED_ROLES = Object.keys(MENU_BY_ROLE);
export const DEFAULT_ROLE  = 'ESTUDIANTE';

export const getMenuByRole = (role) => MENU_BY_ROLE[role] || MENU_BY_ROLE[DEFAULT_ROLE];
