import React from 'react';
import { formatFecha } from '../../constants/procesodeGrado';

const TarjetaSolicitud = ({ solicitud, colores, onAprobar, onRechazar, enCurso }) => {
  const { estudiante, fechaSolicitud, observaciones } = solicitud;
  const iniciales   = (estudiante?.nombre || 'E').slice(0, 2).toUpperCase();
  const procesando  = enCurso === solicitud.id;
  const hayAcciones = onAprobar || onRechazar;

  return (
    <div className={`flex flex-col rounded-2xl border p-5 shadow-sm ${colores.card}`}>
      {/* Cabecera */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colores.avatar}`}
        >
          {iniciales}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{estudiante?.nombre}</p>
          <p className="text-xs text-slate-500">CC {estudiante?.cedula}</p>
        </div>
      </div>

      {/* Detalles */}
      <div className="flex-1 space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Programa
          </span>
          <span className="text-xs leading-relaxed text-slate-700">{estudiante?.programa}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Fecha
          </span>
          <span className="text-xs text-slate-700">{formatFecha(fechaSolicitud)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Trámite
          </span>
          <span className="text-xs text-slate-700">Terminación de Materias</span>
        </div>
        {observaciones && (
          <div className="flex items-start gap-2">
            <span className="mt-0.5 w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Nota
            </span>
            <span className="text-xs italic leading-relaxed text-slate-500">{observaciones}</span>
          </div>
        )}
      </div>

      {/* Acciones (solo pendientes) */}
      {hayAcciones && (
        <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">
          {onAprobar && (
            <button
              type="button"
              disabled={procesando}
              onClick={() => onAprobar(solicitud.id)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                procesando
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {procesando ? 'Procesando…' : 'Aprobar'}
            </button>
          )}
          {onRechazar && (
            <button
              type="button"
              disabled={procesando}
              onClick={() => onRechazar(solicitud.id)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
                procesando
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {procesando ? 'Procesando…' : 'Rechazar'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TarjetaSolicitud;
