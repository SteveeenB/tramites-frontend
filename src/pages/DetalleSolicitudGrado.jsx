import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBandejaGrado } from '../hooks/useBandejaGrado';
import DirectorSidebar from '../components/bandeja-director/DirectorSidebar';
import EstadoBadge from '../components/bandeja-director/EstadoBadge';
import ModalRechazo from '../components/bandeja-director/ModalRechazo';
import { solicitudesApi } from '../api/solicitudesApi';
import { BASE_URL } from '../api/apiClient';

const TIPO_PROYECTO = {
  INVESTIGACION:    'Trabajo de Investigación',
  MONOGRAFIA:       'Monografía',
  SISTEMATIZACION:  'Sistematización del Conocimiento',
  TRABAJO_DIRIGIDO: 'Trabajo Dirigido',
  PASANTIA:         'Pasantía',
};

const TIPO_DOC = {
  FOTO_ESTUDIANTE:    'Fotografía del Estudiante',
  ACTA_SUSTENTACION:  'Acta de Sustentación',
  CERTIFICADO_INGLES: 'Certificado de Inglés',
};

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocCard = ({ doc, solicitudId }) => {
  const esImagen = doc.contentType?.startsWith('image/');
  const esPdf    = doc.contentType === 'application/pdf';
  const label    = TIPO_DOC[doc.tipo] || doc.tipo;
  const fileUrl  = `${BASE_URL}/solicitudes/${solicitudId}/documentos/${doc.id}/file`;

  const iconBg  = esImagen ? 'bg-blue-500' : esPdf ? 'bg-red-500' : 'bg-slate-500';
  const iconTxt = esImagen ? 'IMG' : esPdf ? 'PDF' : 'DOC';

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${iconBg}`}>
          {iconTxt}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{label}</p>
          <p className="truncate text-xs text-slate-500">
            {doc.nombreOriginal}
            {doc.tamano ? <span className="ml-1 text-slate-400">· {formatBytes(doc.tamano)}</span> : null}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        {(esImagen || esPdf) && (
          <button
            type="button"
            onClick={() => window.open(fileUrl, '_blank', 'noopener')}
            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Ver
          </button>
        )}
        <a
          href={fileUrl}
          download={doc.nombreOriginal}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Descargar
        </a>
      </div>
    </div>
  );
};

const DetalleSolicitudGrado = () => {
  const { estado, id } = useParams();
  const navigate = useNavigate();
  const { usuario, bandeja, cargando, aprobar, rechazar, accionEnCurso, errorAccion } = useBandejaGrado();

  const [documentos, setDocumentos]       = useState([]);
  const [cargandoDocs, setCargandoDocs]   = useState(true);
  const [modalRechazo, setModalRechazo]   = useState(false);

  const solicitud = Object.values(bandeja).flat().find(s => String(s.id) === String(id));
  const esPendiente = solicitud?.estado === 'EN_REVISION' || solicitud?.estado === 'PENDIENTE_PAGO';

  useEffect(() => {
    if (!id) return;
    setCargandoDocs(true);
    solicitudesApi.getDocumentos(Number(id), usuario?.cedula)
      .then(setDocumentos)
      .catch(() => setDocumentos([]))
      .finally(() => setCargandoDocs(false));
  }, [id, usuario?.cedula]);

  const handleAprobar = async () => {
    await aprobar(solicitud.id);
    navigate(`/tramites/bandeja-director/grado/${estado}`);
  };

  const handleRechazar = async (sid, motivo) => {
    await rechazar(sid, motivo);
    setModalRechazo(false);
    navigate(`/tramites/bandeja-director/grado/${estado}`);
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
              onClick={() => navigate(`/tramites/bandeja-director/grado/${estado}`)}
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

                {/* ── Info general ────────────────────────────────────── */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Solicitud de Grado #{solicitud.id}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {solicitud.tituloProyecto || 'Sin título'}
                      </h2>
                      {solicitud.tipoProyecto && (
                        <p className="mt-0.5 text-sm text-slate-500">
                          {TIPO_PROYECTO[solicitud.tipoProyecto] ?? solicitud.tipoProyecto}
                        </p>
                      )}
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
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{solicitud.fechaSolicitud || '—'}</p>
                    </div>
                  </div>

                  {solicitud.observacionesDirector && (
                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <span className="font-semibold">Observaciones: </span>
                      {solicitud.observacionesDirector}
                    </div>
                  )}
                </div>

                {/* ── Resumen del proyecto ─────────────────────────────── */}
                {solicitud.resumenProyecto && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-3 text-base font-bold text-slate-900">Resumen del Proyecto</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{solicitud.resumenProyecto}</p>
                  </div>
                )}

                {/* ── Documentos ──────────────────────────────────────── */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="mb-4 text-base font-bold text-slate-900">Documentos adjuntos</h3>
                  {cargandoDocs ? (
                    <p className="text-sm text-slate-400">Cargando documentos…</p>
                  ) : documentos.length === 0 ? (
                    <p className="text-sm text-slate-400">No hay documentos adjuntos.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {documentos.map(doc => <DocCard key={doc.id} doc={doc} solicitudId={id} />)}
                    </div>
                  )}
                </div>

                {/* ── Acciones ────────────────────────────────────────── */}
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

export default DetalleSolicitudGrado;
