import React from 'react';
import { useParams } from 'react-router-dom';
import { useBandejaDirector } from '../hooks/useBandejaDirector';
import DirectorSidebar from '../components/bandeja-director/DirectorSidebar';
import TarjetaSolicitud from '../components/bandeja-director/TarjetaSolicitud';
import { ClockIcon, XCircleIcon, CheckCircleIcon } from '../components/bandeja-director/icons';

const CONFIG = {
  pendientes: {
    label:        'Pendientes — Terminación de Materias',
    icono:        <ClockIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes de terminación de materias pendientes.',
    conAcciones:  true,
    colores: {
      header:      'bg-amber-400',
      iconWrapper: 'bg-amber-100 text-amber-600',
      badge:       'bg-amber-100 text-amber-700',
      card:        'border-amber-200 bg-amber-50',
      avatar:      'bg-amber-200 text-amber-800',
    },
  },
  rechazadas: {
    label:        'Rechazadas — Terminación de Materias',
    icono:        <XCircleIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes de terminación de materias rechazadas.',
    conAcciones:  false,
    colores: {
      header:      'bg-red-400',
      iconWrapper: 'bg-red-100 text-red-600',
      badge:       'bg-red-100 text-red-700',
      card:        'border-red-200 bg-red-50',
      avatar:      'bg-red-200 text-red-800',
    },
  },
  aprobadas: {
    label:        'Aprobadas — Terminación de Materias',
    icono:        <CheckCircleIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes de terminación de materias aprobadas.',
    conAcciones:  false,
    colores: {
      header:      'bg-green-500',
      iconWrapper: 'bg-green-100 text-green-600',
      badge:       'bg-green-100 text-green-700',
      card:        'border-green-200 bg-green-50',
      avatar:      'bg-green-200 text-green-800',
    },
  },
};

const ListaSolicitudesDirector = () => {
  const { estado } = useParams();
  const { usuario, bandeja, cargando, error, aprobar, rechazar, accionEnCurso, errorAccion } =
    useBandejaDirector();

  const cfg         = CONFIG[estado];
  const solicitudes = bandeja[estado] ?? [];

  if (!cfg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-medium text-red-600">Sección no válida.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DirectorSidebar usuario={usuario} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header con el color de la sección */}
          <header
            className={`flex items-center justify-between gap-4 px-6 py-4 text-white shadow-sm md:px-8 ${cfg.colores.header}`}
          >
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">
              DIRECTOR DE PROGRAMA
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                {(usuario?.nombre || 'D').slice(0, 2).toUpperCase()}
              </div>
              <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">
            {/* Breadcrumb */}
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              TRÁMITES / DIRECTOR / TERMINACIÓN DE MATERIAS / {estado.toUpperCase()}
            </div>

            {/* Título con ícono y contador */}
            <div className="mb-8 flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${cfg.colores.iconWrapper}`}>
                {cfg.icono}
              </div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl font-bold text-slate-900">{cfg.label}</h2>
                {!cargando && (
                  <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${cfg.colores.badge}`}>
                    {solicitudes.length}
                  </span>
                )}
              </div>
            </div>

            {/* Error de acción */}
            {errorAccion && (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorAccion}
              </p>
            )}

            {/* Estados de carga/error */}
            {cargando && <p className="text-slate-500">Cargando solicitudes…</p>}
            {error    && <p className="font-medium text-red-600">{error}</p>}

            {/* Lista */}
            {!cargando && !error && (
              solicitudes.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-400">
                  {cfg.mensajeVacio}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {solicitudes.map((s) => (
                    <TarjetaSolicitud
                      key={s.id}
                      solicitud={s}
                      colores={cfg.colores}
                      enCurso={accionEnCurso}
                      onAprobar={cfg.conAcciones ? aprobar : undefined}
                      onRechazar={cfg.conAcciones ? rechazar : undefined}
                    />
                  ))}
                </div>
              )
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ListaSolicitudesDirector;
