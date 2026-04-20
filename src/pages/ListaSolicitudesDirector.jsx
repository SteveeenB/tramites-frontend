import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBandejaDirector } from '../hooks/useBandejaDirector';
import DirectorSidebar from '../components/bandeja-director/DirectorSidebar';
import TarjetaSolicitud from '../components/bandeja-director/TarjetaSolicitud';
import ModalRechazo from '../components/bandeja-director/ModalRechazo';
import { ClockIcon, XCircleIcon, CheckCircleIcon, ArrowLeftIcon } from '../components/bandeja-director/icons';

const CONFIG = {
  pendientes: {
    label:        'Solicitudes Pendientes',
    sublabel:     'Terminación de Materias',
    icono:        <ClockIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes pendientes de revisión.',
    conAcciones:  true,
    colores: {
      header:      'bg-gradient-to-r from-amber-400 to-orange-500',
      iconWrapper: 'bg-amber-100 text-amber-600',
      badge:       'bg-amber-100 text-amber-700',
      card:        'border-amber-200 bg-amber-50',
      avatar:      'bg-amber-200 text-amber-800',
      titulo:      'text-amber-800',
    },
  },
  aprobadas: {
    label:        'Solicitudes Aprobadas',
    sublabel:     'Terminación de Materias',
    icono:        <CheckCircleIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes aprobadas.',
    conAcciones:  false,
    colores: {
      header:      'bg-gradient-to-r from-green-400 to-emerald-600',
      iconWrapper: 'bg-green-100 text-green-600',
      badge:       'bg-green-100 text-green-700',
      card:        'border-green-200 bg-green-50',
      avatar:      'bg-green-200 text-green-800',
      titulo:      'text-green-800',
    },
  },
  rechazadas: {
    label:        'Solicitudes Rechazadas',
    sublabel:     'Terminación de Materias',
    icono:        <XCircleIcon className="h-6 w-6" />,
    mensajeVacio: 'No hay solicitudes rechazadas.',
    conAcciones:  false,
    colores: {
      header:      'bg-gradient-to-r from-red-400 to-rose-600',
      iconWrapper: 'bg-red-100 text-red-600',
      badge:       'bg-red-100 text-red-700',
      card:        'border-red-200 bg-red-50',
      avatar:      'bg-red-200 text-red-800',
      titulo:      'text-red-800',
    },
  },
};

const ListaSolicitudesDirector = () => {
  const { estado }   = useParams();
  const navigate     = useNavigate();
  const {
    usuario, bandeja, cargando, error,
    aprobar, rechazar, accionEnCurso, errorAccion,
  } = useBandejaDirector();

  const [solicitudARechazar, setSolicitudARechazar] = useState(null);

  const cfg         = CONFIG[estado];
  const solicitudes = bandeja[estado] ?? [];

  if (!cfg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-medium text-red-600">Sección no válida.</p>
      </div>
    );
  }

  const handleIniciarRechazo = (id) => {
    const sol = solicitudes.find((s) => s.id === id);
    setSolicitudARechazar(sol ?? { id });
  };

  const handleConfirmarRechazo = async (id, motivo) => {
    await rechazar(id, motivo);
    setSolicitudARechazar(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DirectorSidebar usuario={usuario} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header cromático por estado */}
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
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              TRÁMITES / DIRECTOR / TERMINACIÓN DE MATERIAS /{' '}
              <span className="text-slate-600">{estado.toUpperCase()}</span>
            </div>

            {/* Título + botón volver */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cfg.colores.iconWrapper}`}>
                  {cfg.icono}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">{cfg.label}</h2>
                    {!cargando && (
                      <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${cfg.colores.badge}`}>
                        {solicitudes.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{cfg.sublabel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/tramites/bandeja-director')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a la bandeja
              </button>
            </div>

            {/* Error de acción */}
            {errorAccion && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorAccion}
              </div>
            )}

            {/* Carga / error global */}
            {cargando && (
              <div className="flex items-center gap-3 text-slate-400">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-sm">Cargando solicitudes…</span>
              </div>
            )}
            {error && <p className="font-medium text-red-600">{error}</p>}

            {/* Lista de tarjetas */}
            {!cargando && !error && (
              solicitudes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                    {cfg.icono}
                  </div>
                  <p className="text-sm font-medium text-slate-400">{cfg.mensajeVacio}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {solicitudes.map((s) => (
                    <TarjetaSolicitud
                      key={s.id}
                      solicitud={s}
                      colores={cfg.colores}
                      enCurso={accionEnCurso}
                      onAprobar={cfg.conAcciones ? aprobar : undefined}
                      onRechazar={cfg.conAcciones ? handleIniciarRechazo : undefined}
                    />
                  ))}
                </div>
              )
            )}
          </main>
        </div>
      </div>

      {/* Modal de rechazo */}
      {solicitudARechazar && (
        <ModalRechazo
          solicitud={solicitudARechazar}
          procesando={accionEnCurso === solicitudARechazar.id}
          onConfirmar={handleConfirmarRechazo}
          onCancelar={() => setSolicitudARechazar(null)}
        />
      )}
    </div>
  );
};

export default ListaSolicitudesDirector;
