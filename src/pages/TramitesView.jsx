import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ALLOWED_ROLES, getMenuByRole } from '../config/menuConfig';

// ── Iconos ────────────────────────────────────────────────────────────────────

const GraduationIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm-7 8.18V15l7 3.82 7-3.82v-3.82L12 15 5 11.18z" />
  </svg>
);

const CertificateIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-4 6h6v2H9v-2zm0-4h6v2H9v-2z" />
  </svg>
);

const InboxIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2H19v3zm0-5h-4c0 1.1-.9 2-2 2s-2-.9-2-2H5V5h14v9z" />
  </svg>
);

const HistoryIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);

const PanelIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const UsersIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const SettingsIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

const ArrowRightIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
  </svg>
);

// ── Utilidades ────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  ESTUDIANTE: 'ESTUDIANTES',
  DIRECTOR: 'DIRECTOR DE PROGRAMA',
  ADMIN: 'ADMINISTRADOR',
};

const ROLE_COLORS = {
  ESTUDIANTE: { header: 'bg-red-600', active: 'bg-red-50 text-red-700 ring-1 ring-red-200', badge: 'bg-red-100 text-red-700' },
  DIRECTOR:   { header: 'bg-blue-700', active: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200', badge: 'bg-blue-100 text-blue-700' },
  ADMIN:      { header: 'bg-slate-800', active: 'bg-slate-100 text-slate-900 ring-1 ring-slate-300', badge: 'bg-slate-200 text-slate-800' },
};

// ── Contenido por rol ─────────────────────────────────────────────────────────

const TarjetaAccion = ({ icono, titulo, descripcion, etiqueta, onClick, deshabilitada = false }) => (
  <div
    className={`flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition ${
      deshabilitada ? 'opacity-60' : 'hover:shadow-md'
    }`}
  >
    <div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        {icono}
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-900">{titulo}</h3>
      <p className="text-sm leading-6 text-slate-600">{descripcion}</p>
    </div>
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitada}
      className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        deshabilitada
          ? 'cursor-not-allowed bg-slate-100 text-slate-400'
          : 'bg-red-600 text-white hover:bg-red-700'
      }`}
    >
      {etiqueta} <ArrowRightIcon />
    </button>
  </div>
);

const ContenidoEstudiante = ({ navigate, datosModulo }) => {
  const accionCrear = datosModulo?.acciones?.find((a) => a.codigo === 'CREAR_SOLICITUD');

  return (
    <>
      <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        TRÁMITES / ACADÉMICO
      </div>
      <h2 className="mb-7 text-3xl font-bold text-slate-900">Mis Trámites</h2>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<GraduationIcon />}
          titulo="Proceso de Grado"
          descripcion="Gestiona tu terminación de materias y solicitud de grado. Revisa el estado de tu proceso y los requisitos pendientes."
          etiqueta="Ir al proceso"
          onClick={() => navigate('/proceso-de-grado')}
        />
        <TarjetaAccion
          icono={<CertificateIcon />}
          titulo="Certificados Académicos"
          descripcion="Solicita certificados de notas, constancias de estudio y otros documentos académicos oficiales."
          etiqueta="Solicitar certificado"
          onClick={() => {}}
          deshabilitada={!accionCrear?.habilitada}
        />
      </div>
    </>
  );
};

const ContenidoDirector = ({ navigate, datosModulo }) => {
  const puedeAprobar = datosModulo?.acciones?.find((a) => a.codigo === 'APROBAR_SOLICITUD')?.habilitada;

  return (
    <>
      <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        TRÁMITES / DIRECTOR
      </div>
      <h2 className="mb-7 text-3xl font-bold text-slate-900">Panel del Director</h2>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<InboxIcon className="h-6 w-6" />}
          titulo="Bandeja de Aprobación"
          descripcion="Revisa y aprueba las solicitudes de terminación de materias presentadas por los estudiantes del programa."
          etiqueta="Ver solicitudes"
          onClick={() => {}}
          deshabilitada={!puedeAprobar}
        />
        <TarjetaAccion
          icono={<HistoryIcon className="h-6 w-6" />}
          titulo="Historial de Decisiones"
          descripcion="Consulta el registro histórico de las solicitudes aprobadas y rechazadas."
          etiqueta="Ver historial"
          onClick={() => {}}
        />
      </div>
    </>
  );
};

const ContenidoAdmin = ({ navigate, datosModulo }) => {
  const puedeGestionar = datosModulo?.acciones?.find((a) => a.codigo === 'GESTION_TOTAL')?.habilitada;

  return (
    <>
      <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        TRÁMITES / ADMINISTRACIÓN
      </div>
      <h2 className="mb-7 text-3xl font-bold text-slate-900">Panel Administrativo</h2>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaAccion
          icono={<PanelIcon className="h-6 w-6" />}
          titulo="Panel General"
          descripcion="Vista general de todos los trámites activos, solicitudes pendientes y estadísticas del sistema."
          etiqueta="Ver panel"
          onClick={() => {}}
          deshabilitada={!puedeGestionar}
        />
        <TarjetaAccion
          icono={<UsersIcon className="h-6 w-6" />}
          titulo="Gestión de Usuarios"
          descripcion="Administra los usuarios del sistema: estudiantes, directores de programa y personal administrativo."
          etiqueta="Gestionar usuarios"
          onClick={() => {}}
          deshabilitada={!puedeGestionar}
        />
        <TarjetaAccion
          icono={<SettingsIcon className="h-6 w-6" />}
          titulo="Configuración"
          descripcion="Configura los parámetros del sistema, convocatorias, créditos requeridos por programa y más."
          etiqueta="Configurar"
          onClick={() => {}}
          deshabilitada={!puedeGestionar}
        />
      </div>
    </>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

const TramitesView = () => {
  const navigate = useNavigate();
  const { usuario, cambiarRol } = useAuth();

  const [datosModulo, setDatosModulo] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState('');

  const rol = usuario?.rol || 'ESTUDIANTE';
  const colores = ROLE_COLORS[rol] || ROLE_COLORS.ESTUDIANTE;
  const menuItems = getMenuByRole(rol);

  // Selecciona el primer ítem al cambiar de rol
  useEffect(() => {
    setSelectedMenuId(menuItems[0]?.id || '');
  }, [rol, menuItems]);

  // Carga datos del módulo desde el backend
  useEffect(() => {
    if (!usuario?.cedula) return;

    const fetchModulo = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/tramites?cedula=${usuario.cedula}`,
        );
        if (res.ok) {
          const json = await res.json();
          setDatosModulo(json);
        }
      } catch {
        // el contenido se muestra igual con datos del menuConfig
      }
    };

    fetchModulo();
  }, [usuario?.cedula]);

  const manejarSeleccion = (item) => {
    setSelectedMenuId(item.id);
    if (item.route && item.route !== '/tramites') {
      navigate(item.route);
    }
  };

  const renderContenido = () => {
    switch (rol) {
      case 'DIRECTOR':
        return <ContenidoDirector navigate={navigate} datosModulo={datosModulo} />;
      case 'ADMIN':
        return <ContenidoAdmin navigate={navigate} datosModulo={datosModulo} />;
      default:
        return <ContenidoEstudiante navigate={navigate} datosModulo={datosModulo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full flex-col border-b border-slate-200 bg-white lg:w-80 lg:border-b-0 lg:border-r">
          <div className="flex-1 px-5 py-6">
            {/* Info usuario */}
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${colores.badge}`}
              >
                {(usuario?.nombre || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {ROLE_LABELS[rol] || rol}
                </p>
                <p className="font-semibold text-slate-900">{usuario?.nombre || 'Usuario'}</p>
              </div>
            </div>

            {/* Navegación */}
            <nav className="space-y-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <button
                  type="button"
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold ${colores.active}`}
                >
                  Trámites
                </button>
                <div className="mt-2 space-y-1 pl-3">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => manejarSeleccion(item)}
                      className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
                        selectedMenuId === item.id
                          ? colores.active
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Selector de rol demo */}
          <div className="border-t border-slate-200 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Demo — cambiar rol
            </p>
            <div className="flex flex-col gap-2">
              {ALLOWED_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => cambiarRol(r)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                    rol === r
                      ? `${colores.active}`
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ROLE_LABELS[r] || r}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Área principal */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header
            className={`flex items-center justify-between gap-4 px-6 py-4 text-white shadow-sm md:px-8 ${colores.header}`}
          >
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">
              {ROLE_LABELS[rol] || rol}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                  {(usuario?.nombre || 'U').slice(0, 2).toUpperCase()}
                </div>
                <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
              </div>
            </div>
          </header>

          {/* Contenido */}
          <main className="flex-1 p-6 md:p-8">{renderContenido()}</main>
        </div>
      </div>
    </div>
  );
};

export default TramitesView;
