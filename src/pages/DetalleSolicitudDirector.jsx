import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBandejaDirector } from '../hooks/useBandejaDirector';
import DirectorSidebar from '../components/bandeja-director/DirectorSidebar';
import EstadoBadge from '../components/bandeja-director/EstadoBadge';
import ModalRechazo from '../components/bandeja-director/ModalRechazo';
import { formatFecha, formatCOP } from '../constants/procesodeGrado';

const DetalleSolicitudDirector = () => {
  const { estado, id } = useParams();
  const navigate = useNavigate();
  const { usuario, bandeja, cargando, aprobar, rechazar, accionEnCurso, errorAccion } = useBandejaDirector();
  const [modalRechazo, setModalRechazo] = useState(false);

  const solicitud = Object.values(bandeja).flat().find(s => String(s.id) === String(id));
  const esPendiente = solicitud?.estado === 'EN_REVISION';

  const handleAprobar = async () => {
    await aprobar(solicitud.id);
    navigate(`/tramites/bandeja-director/${estado}`);
  };

  const handleRechazar = async (sid, motivo) => {
    await rechazar(sid, motivo);
    setModalRechazo(false);
    navigate(`/tramites/bandeja-director/${estado}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DirectorSidebar usuario={usuario} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 bg-blue-700 px-6 py-4 text-white shadow-sm md:px-8">
            <h1 className="text-lg font-bold uppercase tracking-[0.18em] md:text-xl">DIRECTOR DE PROGRAMA</h1>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                {(usuario?.nombre || 'D').slice(0, 2).toUpperCase()}
              </div>
              <p className="hidden text-sm font-semibold sm:block">{usuario?.nombre}</p>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">
            <button
              type="button"
              onClick={() => navigate(`/tramites/bandeja-director/${estado}`)}
              className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver a la lista
            </button>

            {(cargando || !solicitud) && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <span className="text-sm font-medium">Cargando solicitud…</span>
              </div>
            )}

            {!cargando && solicitud && (
              <div className="mx-auto flex max-w-3xl flex-col gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Terminación de Materias
                      </p>
                      <p className="font-mono text-xs font-semibold text-blue-700">
                        {solicitud.radicado ?? `#${solicitud.id}`}
                      </p>
                    </div>
                    <EstadoBadge estado={solicitud.estado} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estudiante</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{solicitud.estudiante?.nombre}</p>
                      <p className="text-xs text-slate-500">CC {solicitud.estudiante?.cedula}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Programa</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{solicitud.estudiante?.programa || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha solicitud</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{formatFecha(solicitud.fechaSolicitud)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Valor del trámite</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">
                        {formatCOP(solicitud.costo)}
                      </p>
                    </div>
                  </div>

                  {solicitud.observaciones && (
                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <span className="font-semibold">Observaciones: </span>
                      {solicitud.observaciones}
                    </div>
                  )}
                </div>

                {errorAccion && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorAccion}</p>
                )}

                {esPendiente && (
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={!!accionEnCurso}
                      onClick={() => setModalRechazo(true)}
                      className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                    <button
                      type="button"
                      disabled={!!accionEnCurso}
                      onClick={handleAprobar}
                      className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      {accionEnCurso ? 'Procesando…' : 'Aprobar Solicitud'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {modalRechazo && solicitud && (
        <ModalRechazo
          solicitud={solicitud}
          procesando={!!accionEnCurso}
          onConfirmar={handleRechazar}
          onCancelar={() => setModalRechazo(false)}
        />
      )}
    </div>
  );
};

export default DetalleSolicitudDirector;
