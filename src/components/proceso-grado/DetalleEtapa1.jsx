import React from 'react';
import { CheckIcon, WarningIcon, SendIcon } from './icons';
import { formatFecha } from '../../constants/procesodeGrado';
import TarjetaLiquidacion from './TarjetaLiquidacion';

const DetalleEtapa1 = ({
  porcentaje,
  faltantes,
  etapa1Completada,
  convocatoria,
  estadoAcademico,
  solicitud,
  enviando,
  errorSolicitud,
  onSolicitar,
  aprobada,
}) => {
  if (aprobada) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 shadow-sm">
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
      {etapa1Completada
        ? 'Has completado el 100% de los créditos requeridos.'
        : `Te faltan ${faltantes} créditos. Debes completar el 100% para habilitar este trámite.`}
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

    {/* Botón o tarjeta de liquidación */}
    {solicitud ? (
      <TarjetaLiquidacion solicitud={solicitud} />
    ) : (
      <>
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
          {enviando ? 'Enviando solicitud…' : 'Solicitar Terminación de Materias'}
        </button>

        {!etapa1Completada && (
          <p className="text-sm font-medium text-red-600">
            No disponible: requisitos académicos incompletos.
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
