import React from 'react';
import { formatFecha } from '../../constants/procesodeGrado';

const TarjetaSolicitudGrado = ({ solicitud, colores, onAprobar, onRechazar, enCurso }) => {
  const { estudiante, fechaSolicitud, observacionesDirector, estado,
          documentosCargados, documentosRequeridos } = solicitud;

  const iniciales  = (estudiante?.nombre || 'E').slice(0, 2).toUpperCase();
  const procesando = enCurso === solicitud.id;
  const hayAcciones = onAprobar || onRechazar;

  const creditosAprobados  = estudiante?.creditosAprobados ?? 0;
  const creditosRequeridos = estudiante?.creditosRequeridos ?? 0;
  const porcentajeCreditos = creditosRequeridos > 0
    ? Math.min(100, Math.round((creditosAprobados / creditosRequeridos) * 100))
    : 0;

  const docsCargados  = documentosCargados ?? 0;
  const docsRequeridos = documentosRequeridos ?? 0;
  const docsCompletos  = docsRequeridos > 0 && docsCargados >= docsRequeridos;

  return (
    <div className={`flex flex-col rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${colores.card}`}>
      {/* Cabecera */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colores.avatar}`}>
          {iniciales}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{estudiante?.nombre}</p>
          <p className="text-xs text-slate-500">CC {estudiante?.cedula}</p>
        </div>
      </div>

      {/* Detalles */}
      <dl className="flex-1 space-y-1.5">
        <div className="flex items-start gap-2">
          <dt className="mt-0.5 w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Programa</dt>
          <dd className="text-xs leading-relaxed text-slate-700">{estudiante?.programa}</dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha</dt>
          <dd className="text-xs text-slate-700">{formatFecha(fechaSolicitud)}</dd>
        </div>

        {/* Créditos con barra de progreso */}
        <div className="flex items-start gap-2">
          <dt className="mt-0.5 w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Créditos</dt>
          <dd className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-slate-700">
                {creditosAprobados} / {creditosRequeridos}
              </span>
              <span className="text-xs text-slate-500">{porcentajeCreditos}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200">
              <div
                className={`h-1.5 rounded-full ${porcentajeCreditos >= 100 ? 'bg-green-500' : 'bg-amber-400'}`}
                style={{ width: `${porcentajeCreditos}%` }}
              />
            </div>
          </dd>
        </div>

        {/* Documentos */}
        <div className="flex items-center gap-2">
          <dt className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Docs</dt>
          <dd>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              docsCompletos
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {docsCompletos ? (
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              )}
              {docsCargados}/{docsRequeridos} cargados
            </span>
          </dd>
        </div>

        {estado && (
          <div className="flex items-center gap-2">
            <dt className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Estado</dt>
            <dd>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${colores.badge}`}>
                {estado === 'EN_REVISION'   ? 'En revisión'
                  : estado === 'PAGO_PENDIENTE' ? 'Pago pendiente'
                  : estado === 'RECHAZADA'      ? 'Rechazada'
                  : estado}
              </span>
            </dd>
          </div>
        )}

        {observacionesDirector && (
          <div className="flex items-start gap-2">
            <dt className="mt-0.5 w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Nota</dt>
            <dd className="text-xs italic leading-relaxed text-slate-500">{observacionesDirector}</dd>
          </div>
        )}
      </dl>

      {/* Acciones */}
      {hayAcciones && (
        <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">
          {onAprobar && (
            <button
              type="button"
              disabled={procesando}
              onClick={() => onAprobar(solicitud.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                procesando
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
              }`}
            >
              {procesando ? 'Procesando…' : (
                <>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Aprobar
                </>
              )}
            </button>
          )}
          {onRechazar && (
            <button
              type="button"
              disabled={procesando}
              onClick={() => onRechazar(solicitud.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition ${
                procesando
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
              }`}
            >
              {procesando ? 'Procesando…' : (
                <>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  Rechazar
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TarjetaSolicitudGrado;
