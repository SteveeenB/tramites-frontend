import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const CheckIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
  </svg>
);

const WarningIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M1 21h22L12 2 1 21zm11-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const LockIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v7h16v-7a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 9V7a3 3 0 1 1 6 0v4H9z" />
  </svg>
);

const OpenLockIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17 8h-1V6a4 4 0 0 0-8 0h2a2 2 0 1 1 4 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z" />
  </svg>
);

const ProhibitedIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.7 13.3-1.4 1.4L12 13.4 8.7 16.7l-1.4-1.4L10.6 12 7.3 8.7l1.4-1.4L12 10.6l3.3-3.3 1.4 1.4L13.4 12z" />
  </svg>
);

const SidebarLink = ({ children, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
      active
        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

const formatFecha = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ProcesodeGrado = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const fechaActual = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    if (!usuario?.cedula) return;

    const fetchDatos = async () => {
      setCargando(true);
      setError('');
      try {
        const res = await fetch(
          `http://localhost:8080/api/tramites/proceso-grado?cedula=${usuario.cedula}`,
        );
        if (!res.ok) throw new Error('No se pudo cargar el proceso de grado');
        const json = await res.json();
        setDatos(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };

    fetchDatos();
  }, [usuario?.cedula]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Cargando proceso de grado…</p>
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-medium text-red-600">{error || 'Sin datos disponibles'}</p>
      </div>
    );
  }

  const { estudiante, creditos, estadoAcademico, convocatoria, etapa1Completada, etapa2Disponible } =
    datos;

  const aprobados = Number(creditos?.aprobados || 0);
  const requeridos = Number(creditos?.requeridos || 0);
  const porcentaje = requeridos > 0 ? Math.min(100, Math.round((aprobados / requeridos) * 100)) : 0;
  const faltantes = Math.max(requeridos - aprobados, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full flex-col border-b border-slate-200 bg-white lg:w-80 lg:border-b-0 lg:border-r">
          <div className="flex-1 px-5 py-6">
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-red-100 text-lg font-bold text-red-700">
                {estudiante?.avatar ? (
                  <img
                    src={estudiante.avatar}
                    alt={estudiante?.nombre || 'Estudiante'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{(estudiante?.nombre || 'E').slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Estudiante
                </p>
                <p className="font-semibold text-slate-900">{estudiante?.nombre || 'Estudiante'}</p>
                {estudiante?.programaAcademico && (
                  <p className="mt-0.5 text-xs text-slate-500">{estudiante.programaAcademico}</p>
                )}
              </div>
            </div>

            <nav className="space-y-2">
              <SidebarLink>Información Estudiantil</SidebarLink>
              <SidebarLink>Información Académica</SidebarLink>

              <div className="rounded-2xl bg-slate-50 p-3">
                <SidebarLink active>Trámites</SidebarLink>
                <div className="mt-2 space-y-2 pl-3">
                  <button
                    type="button"
                    className="w-full rounded-xl bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 ring-1 ring-red-200"
                  >
                    Proceso de Grado
                  </button>
                  <SidebarLink onClick={() => navigate('/tramites')}>Certificados</SidebarLink>
                </div>
              </div>
            </nav>
          </div>

          <div className="border-t border-slate-200 p-5">
            <button
              type="button"
              onClick={() => navigate('/tramites')}
              className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ← Volver a Trámites
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 bg-red-600 px-6 py-4 text-white shadow-sm md:px-8">
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">ESTUDIANTES</h1>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                type="button"
                className="rounded-full p-2 transition hover:bg-white/10"
                aria-label="Notificaciones"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M12 2a5 5 0 0 0-5 5v2.1c0 .8-.2 1.6-.6 2.3L5 13v2h14v-2l-.4-.6c-.4-.7-.6-1.5-.6-2.3V7a5 5 0 0 0-5-5zM9.5 19a2.5 2.5 0 0 0 5 0h-5z" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/20 text-sm font-semibold">
                  <span>{(estudiante?.nombre || 'AV').slice(0, 2).toUpperCase()}</span>
                </div>
                <p className="text-sm font-semibold">{estudiante?.nombre || 'Estudiante'}</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/tramites')}
                className="rounded-xl border border-white/30 px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                Salida
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              TRÁMITES / ACADÉMICO
            </div>

            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-bold text-slate-900">Proceso de Grado</h2>
              <div className="text-sm font-medium text-slate-500">{fechaActual}</div>
            </div>

            {/* Etapas resumen */}
            <div className="mb-8 grid gap-4 lg:grid-cols-2">
              <div
                className={`rounded-2xl bg-white p-5 shadow-sm ${
                  etapa1Completada ? 'border border-green-200' : 'border border-amber-200'
                }`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      etapa1Completada ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {etapa1Completada ? <CheckIcon /> : <WarningIcon />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Terminación de Materias</h3>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        etapa1Completada ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {etapa1Completada ? 'COMPLETADA' : 'EN CURSO'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      etapa2Disponible ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {etapa2Disponible ? <OpenLockIcon /> : <LockIcon />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Solicitud de Grado</h3>
                    <p className="text-sm text-slate-500">Se habilita al completar la Etapa 1</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalle */}
            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <WarningIcon />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Etapa 1: Requisitos previos</h3>
                </div>

                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Créditos aprobados</span>
                    <span className="text-lg font-bold text-slate-900">{porcentaje}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        porcentaje === 100 ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>

                <p className="mb-5 max-w-2xl text-sm leading-6 text-slate-600">
                  {etapa1Completada
                    ? 'Has completado el 100% de los créditos requeridos.'
                    : `Te faltan ${faltantes} créditos. Debes completar el 100% de los créditos para habilitar este trámite.`}
                </p>

                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-700">
                    Próxima convocatoria:{' '}
                    {convocatoria
                      ? `${formatFecha(convocatoria.fechaInicio)} al ${formatFecha(convocatoria.fechaFin)}`
                      : 'Sin convocatoria'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Estado académico: {estadoAcademico || 'Sin estado'}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!etapa1Completada}
                  className={`mb-3 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    etapa1Completada
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'cursor-not-allowed bg-slate-300 text-slate-500'
                  }`}
                >
                  <ProhibitedIcon />
                  Solicitar Terminación de Materias
                </button>

                {!etapa1Completada && (
                  <p className="text-sm font-medium text-red-600">
                    No disponible: requisitos académicos incompletos.
                  </p>
                )}
              </section>

              <aside
                className={`rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm ${
                  etapa2Disponible ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <h3 className="mb-3 text-xl font-bold text-slate-900">Etapa 2: Solicitud de Grado</h3>
                <p className="text-sm leading-6 text-slate-600">
                  Disponible una vez aprobada la Terminación de Materias.
                </p>

                {!etapa2Disponible && (
                  <div className="mt-4 inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Bloqueada
                  </div>
                )}
              </aside>

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-start-2 xl:row-start-2">
                <h3 className="mb-3 text-lg font-bold text-slate-900">¿Necesitas ayuda?</h3>
                <p className="mb-4 text-sm leading-6 text-slate-600">
                  Si consideras que hay un error en tus créditos, contacta a la oficina de Registro y
                  Control Académico.
                </p>
                <button type="button" className="text-sm font-semibold text-red-600 hover:text-red-700">
                  Contactar soporte académico ↗
                </button>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProcesodeGrado;
