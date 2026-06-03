import React from 'react';
import { CheckIcon, WarningIcon, SendIcon } from './icons';
import TarjetaLiquidacion from './TarjetaLiquidacion';
import BotonActaTerminacion from '../tramites/BotonActaTerminacion';

const fmtFecha = (f) => {
  if (!f) return '—';
  try {
    return new Date(f + (String(f).includes('T') ? '' : 'T00:00:00'))
      .toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return f; }
};

const DetalleEtapa1 = ({
  porcentaje,
  faltantes,
  etapa1Completada,
  estadoAcademico,
  solicitud,
  enviando,
  errorSolicitud,
  onSolicitar,
  aprobada,
  onDescargarCertificado,
  descargandoCert = false,
  actaDisponible = false,
}) => {
  if (aprobada) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
        {/* Encabezado */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckIcon />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-900">Etapa 1: Terminación de Materias</span>
            <span className="ml-3 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-700">
              Aprobada
            </span>
          </div>
        </div>

        {/* Detalle de la solicitud */}
        {solicitud && (
          <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {solicitud.radicado && (
              <div className="col-span-2">
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">N.° de radicado</p>
                <p className="font-mono text-sm font-semibold text-blue-700">{solicitud.radicado}</p>
              </div>
            )}
            <div>
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Trámite</p>
              <p className="font-medium text-slate-800">Terminación de Materias</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha de solicitud</p>
              <p className="font-medium text-slate-800">{fmtFecha(solicitud.fechaSolicitud)}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Fecha de aprobación</p>
              <p className="font-medium text-slate-800">{fmtFecha(solicitud.fechaDecision)}</p>
            </div>
            {solicitud.cedulaDirector && (
              <div>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Director</p>
                <p className="font-medium text-slate-800">{solicitud.cedulaDirector}</p>
              </div>
            )}
            {solicitud.observacionesDirector && (
              <div className="col-span-2">
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Observaciones del director</p>
                <p className="font-medium text-slate-800">{solicitud.observacionesDirector}</p>
              </div>
            )}
          </div>
        )}

        {actaDisponible ? (
          <BotonActaTerminacion
            onGenerar={onDescargarCertificado}
            disabled={descargandoCert}
            cargando={descargandoCert}
          />
        ) : (
          <p className="text-xs font-medium text-slate-400">
            El acta estará disponible cuando la oficina de posgrados la genere.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
          <WarningIcon />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Etapa 1: Requisitos previos</h3>
      </div>

      {/* Barra de créditos */}
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
        {porcentaje >= 100
          ? 'Has completado el 100% de los créditos requeridos.'
          : `Te faltan ${faltantes} créditos. Debes completar el 100% para habilitar este trámite.`}
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
          Estado académico: {estadoAcademico || 'Regular'}
        </span>
      </div>

      {/* Botón o tarjeta de liquidación */}
      {solicitud && solicitud.estado !== 'RECHAZADA' ? (
        <TarjetaLiquidacion solicitud={solicitud} />
      ) : (
        <>
          {solicitud?.estado === 'RECHAZADA' && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-500">Solicitud rechazada</p>
              <p className="text-sm font-medium text-red-800">
                {solicitud.observaciones || 'Tu solicitud fue rechazada por el director.'}
              </p>
              <p className="mt-2 text-xs text-red-600">Puedes enviar una nueva solicitud.</p>
            </div>
          )}
          <button
            type="button"
            disabled={!etapa1Completada || enviando}
            onClick={onSolicitar}
            className={`mb-3 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              etapa1Completada && !enviando
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'cursor-not-allowed bg-slate-300 text-slate-500'
            }`}
          >
            <SendIcon />
            {enviando ? 'Enviando solicitud…' : solicitud?.estado === 'RECHAZADA' ? 'Solicitar nuevamente' : 'Solicitar Terminación de Materias'}
          </button>

          {!etapa1Completada && (
            <p className="text-sm font-medium text-red-600">
              No disponible: debes completar el 100% de los créditos requeridos.
            </p>
          )}
          {errorSolicitud && (
            <p className="mt-2 text-sm font-medium text-red-600">{errorSolicitud}</p>
          )}
        </>
      )}
    </section>
  );
};

export default DetalleEtapa1;